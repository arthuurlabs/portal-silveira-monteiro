import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteProcess = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/processes/:id',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Excluir processo',
                operationId: 'deleteProcess',
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

            const process = await db.process.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!process) {
                throw new NotFoundError('Processo não encontrado');
            }

            await db.process.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
