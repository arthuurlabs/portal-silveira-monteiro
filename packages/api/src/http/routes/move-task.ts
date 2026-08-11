import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { BadRequestError } from '../_errors/bad-request.js';
import { NotFoundError } from '../_errors/not-found.js';
import { moveTaskBodySchema } from './task-schemas.js';

const POSITION_GAP = 1000;

export const moveTask = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/tasks/:id/move',
        {
            schema: {
                tags: ['Tasks'],
                summary: 'Mover tarefa entre colunas e reordenar',
                operationId: 'moveTask',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: moveTaskBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const { status, orderedIds } = request.body;
            const userId = request.user.id;

            const existingTask = await db.task.findFirst({
                where: { id, userId },
                select: { id: true },
            });

            if (!existingTask) {
                throw new NotFoundError('Tarefa não encontrada');
            }

            const ownedCount = await db.task.count({
                where: { id: { in: orderedIds }, userId },
            });

            if (ownedCount !== orderedIds.length) {
                throw new BadRequestError('Lista de tarefas inválida para reordenação');
            }

            await db.$transaction([
                db.task.update({
                    where: { id },
                    data: { status },
                }),
                ...orderedIds.map((taskId, index) =>
                    db.task.update({
                        where: { id: taskId },
                        data: { position: (index + 1) * POSITION_GAP },
                    })
                ),
            ]);

            return reply.status(200).send({ id });
        }
    );
