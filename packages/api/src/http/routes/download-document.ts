import { PassThrough } from 'node:stream';

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { downloadFromFtp } from '../../lib/ftp-storage.js';
import { NotFoundError } from '../_errors/not-found.js';

export const downloadDocument = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/documents/:id/download',
        {
            schema: {
                tags: ['Documents'],
                summary: 'Baixar documento',
                operationId: 'downloadDocument',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const document = await db.document.findUnique({
                where: { id },
                select: { originalName: true, mimeType: true, remotePath: true },
            });

            if (!document) {
                throw new NotFoundError('Documento não encontrado');
            }

            const stream = new PassThrough();

            downloadFromFtp(document.remotePath, stream).catch((error) => {
                request.log.error(error);
                stream.destroy(
                    error instanceof Error ? error : new Error('Falha ao baixar arquivo')
                );
            });

            reply.type(document.mimeType);
            reply.header(
                'Content-Disposition',
                `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`
            );

            return reply.send(stream);
        }
    );
