import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    DOCUMENT_DETAIL_SELECT,
    type DocumentDetailRow,
    documentDetailSchema,
    serializeDocumentDetail,
} from './document-schemas.js';

export const listDocuments = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/clients/:clientId/documents',
        {
            schema: {
                tags: ['Documents'],
                summary: 'Listar documentos do cliente ou de uma empresa',
                operationId: 'listDocuments',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                querystring: z.object({ companyId: z.string().optional() }),
                response: {
                    200: z.object({
                        data: z.array(documentDetailSchema),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { clientId } = request.params;
            const { companyId } = request.query;

            const client = await db.client.findUnique({
                where: { id: clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const documents = (await db.document.findMany({
                where: { clientId, companyId: companyId ?? null },
                select: DOCUMENT_DETAIL_SELECT,
                orderBy: { createdAt: 'desc' },
            })) as DocumentDetailRow[];

            return reply
                .status(200)
                .send({ data: documents.map(serializeDocumentDetail) });
        }
    );
