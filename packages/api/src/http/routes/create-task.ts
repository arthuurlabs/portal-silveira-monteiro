import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { taskCreateBodySchema } from './task-schemas.js';

const POSITION_GAP = 1000;

export const createTask = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/tasks',
        {
            schema: {
                tags: ['Tasks'],
                summary: 'Criar tarefa',
                operationId: 'createTask',
                security: [{ cookieAuth: [] }],
                body: taskCreateBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const userId = request.user.id;
            const { status = 'TODO', dueDate, ...body } = request.body;

            const { _max } = await db.task.aggregate({
                where: { userId, status },
                _max: { position: true },
            });

            const task = await db.task.create({
                data: {
                    ...body,
                    userId,
                    status,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    position: (_max.position ?? 0) + POSITION_GAP,
                },
                select: { id: true },
            });

            return reply.status(201).send(task);
        }
    );
