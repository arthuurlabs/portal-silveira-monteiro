import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { deleteFromFtp } from '../../lib/ftp-storage.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteDocument = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/documents/:id',
        {
            schema: {
                tags: ['Documents'],
                summary: 'Excluir documento',
                operationId: 'deleteDocument',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const document = await db.document.findUnique({
                where: { id },
                select: { id: true, remotePath: true },
            });

            if (!document) {
                throw new NotFoundError('Documento não encontrado');
            }

            await deleteFromFtp(document.remotePath);
            await db.document.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
