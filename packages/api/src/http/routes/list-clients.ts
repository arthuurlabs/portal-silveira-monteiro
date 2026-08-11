import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import {
    CLIENT_DETAIL_SELECT,
    type ClientDetailRow,
    clientDetailSchema,
    serializeClientDetail,
} from './client-schemas.js';

const listClientsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    isActive: z.enum(['true', 'false']).optional(),
});

export const listClients = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/clients',
        {
            schema: {
                tags: ['Clients'],
                summary: 'Listar clientes',
                operationId: 'listClients',
                security: [{ cookieAuth: [] }],
                querystring: listClientsQuerySchema,
                response: {
                    200: z.object({
                        data: z.array(clientDetailSchema),
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
            const { page, pageSize, search, isActive } = request.query;

            const where = {
                ...(search
                    ? {
                          OR: [
                              { fullName: { contains: search, mode: 'insensitive' as const } },
                              { cpf: { contains: search } },
                          ],
                      }
                    : {}),
                ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
            };

            const [rows, total] = (await db.$transaction([
                db.client.findMany({
                    where,
                    select: CLIENT_DETAIL_SELECT,
                    orderBy: { fullName: 'asc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                db.client.count({ where }),
            ])) as [ClientDetailRow[], number];

            return reply.status(200).send({
                data: rows.map(serializeClientDetail),
                pagination: {
                    page,
                    pageSize,
                    total,
                    pageCount: Math.ceil(total / pageSize),
                },
            });
        }
    );
