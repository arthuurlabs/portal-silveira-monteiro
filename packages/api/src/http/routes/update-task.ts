import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { taskUpdateBodySchema } from './task-schemas.js';

export const updateTask = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/tasks/:id',
        {
            schema: {
                tags: ['Tasks'],
                summary: 'Atualizar tarefa',
                operationId: 'updateTask',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: taskUpdateBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.id;

            const existingTask = await db.task.findFirst({
                where: { id, userId },
                select: { id: true },
            });

            if (!existingTask) {
                throw new NotFoundError('Tarefa não encontrada');
            }

            const { dueDate, ...body } = request.body;

            const task = await db.task.update({
                where: { id },
                data: {
                    ...body,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                },
                select: { id: true },
            });

            return reply.status(200).send(task);
        }
    );
