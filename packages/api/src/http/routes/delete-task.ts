import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteTask = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/tasks/:id',
        {
            schema: {
                tags: ['Tasks'],
                summary: 'Excluir tarefa',
                operationId: 'deleteTask',
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
            const userId = request.user.id;

            const task = await db.task.findFirst({
                where: { id, userId },
                select: { id: true },
            });

            if (!task) {
                throw new NotFoundError('Tarefa não encontrada');
            }

            await db.task.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
