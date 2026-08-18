import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import {
    PROCESS_DETAIL_SELECT,
    type ProcessDetailRow,
    processDetailSchema,
    serializeProcessDetail,
} from './process-schemas.js';

const listProcessesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listProcesses = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/processes',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Listar processos',
                operationId: 'listProcesses',
                security: [{ cookieAuth: [] }],
                querystring: listProcessesQuerySchema,
                response: {
                    200: z.object({
                        data: z.array(processDetailSchema),
                        pagination: z.object({
                            page: z.number(),
                            pageSize: z.number(),
                            total: z.number(),
                            pageCount: z.number(),
                        }),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { page, pageSize } = request.query;

            const [rows, total] = (await db.$transaction([
                db.process.findMany({
                    select: PROCESS_DETAIL_SELECT,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                db.process.count(),
            ])) as [ProcessDetailRow[], number];

            return reply.status(200).send({
                data: rows.map(serializeProcessDetail),
                pagination: {
                    page,
                    pageSize,
                    total,
                    pageCount: Math.ceil(total / pageSize),
                },
            });
        }
    );
