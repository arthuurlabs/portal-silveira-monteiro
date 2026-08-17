import { randomUUID } from 'node:crypto';

import type { MultipartFile } from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { env } from '../../env.js';
import { deleteFromFtp, uploadToFtp } from '../../lib/ftp-storage.js';
import { BadRequestError } from '../_errors/bad-request.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    ALLOWED_DOCUMENT_MIME_TYPES,
    DOCUMENT_DETAIL_SELECT,
    type DocumentDetailRow,
    documentDetailSchema,
    serializeDocumentDetail,
} from './document-schemas.js';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

export const uploadDocument = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/clients/:clientId/documents',
        {
            schema: {
                tags: ['Documents'],
                summary: 'Enviar documento',
                operationId: 'uploadDocument',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                response: {
                    201: documentDetailSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { clientId } = request.params;

            const client = await db.client.findUnique({
                where: { id: clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            let companyId: string | null = null;
            let filePart: MultipartFile | null = null;

            for await (const part of request.parts()) {
                if (part.type === 'field' && part.fieldname === 'companyId') {
                    if (typeof part.value === 'string' && part.value.trim()) {
                        companyId = part.value.trim();
                    }
                    continue;
                }

                if (part.type === 'file') {
                    filePart = part;
                    break;
                }
            }

            if (!filePart) {
                throw new BadRequestError('Nenhum arquivo enviado');
            }

            if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(filePart.mimetype as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
                throw new BadRequestError('Tipo de arquivo não permitido');
            }

            if (companyId) {
                const company = await db.company.findUnique({
                    where: { id: companyId },
                    select: { legalRepresentativeId: true },
                });

                if (!company || company.legalRepresentativeId !== clientId) {
                    throw new NotFoundError('Empresa não encontrada');
                }
            }

            const extension = EXTENSION_BY_MIME_TYPE[filePart.mimetype] ?? '';
            const storedName = `${randomUUID()}${extension}`;
            const remotePath = `${env.FTP_BASE_PATH}/${clientId}/${storedName}`;

            try {
                await uploadToFtp(remotePath, filePart.file);
            } catch (error) {
                request.log.error(error);
                throw new Error('Não foi possível enviar o arquivo');
            }

            if (filePart.file.truncated) {
                await deleteFromFtp(remotePath);
                throw new BadRequestError(
                    'Arquivo excede o tamanho máximo permitido (50MB)',
                );
            }

            const document = (await db.document.create({
                data: {
                    clientId,
                    companyId,
                    userId: request.user.id,
                    originalName: filePart.filename,
                    remotePath,
                    mimeType: filePart.mimetype,
                    size: filePart.file.bytesRead,
                },
                select: DOCUMENT_DETAIL_SELECT,
            })) as DocumentDetailRow;

            return reply.status(201).send(serializeDocumentDetail(document));
        }
    );
