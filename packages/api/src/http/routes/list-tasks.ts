import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import {
    serializeTaskDetail,
    TASK_DETAIL_SELECT,
    taskDetailSchema,
    type TaskDetailRow,
} from './task-schemas.js';

export const listTasks = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/tasks',
        {
            schema: {
                tags: ['Tasks'],
                summary: 'Listar tarefas do usuário logado',
                operationId: 'listTasks',
                security: [{ cookieAuth: [] }],
                response: {
                    200: z.object({
                        data: z.array(taskDetailSchema),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const tasks = (await db.task.findMany({
                where: { userId: request.user.id },
                select: TASK_DETAIL_SELECT,
                orderBy: [{ status: 'asc' }, { position: 'asc' }],
            })) as TaskDetailRow[];

            return reply.status(200).send({ data: tasks.map(serializeTaskDetail) });
        }
    );
