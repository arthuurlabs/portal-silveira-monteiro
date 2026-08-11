import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';

const listClientsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    isActive: z.enum(['true', 'false']).optional(),
});

const clientListItemSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    cpf: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
});

type ClientListRow = {
    id: string;
    fullName: string;
    cpf: string;
    phone: string | null;
    email: string | null;
    isActive: boolean;
    createdAt: Date;
};

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
                        data: z.array(clientListItemSchema),
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
                    select: {
                        id: true,
                        fullName: true,
                        cpf: true,
                        phone: true,
                        email: true,
                        isActive: true,
                        createdAt: true,
                    },
                    orderBy: { fullName: 'asc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                db.client.count({ where }),
            ])) as [ClientListRow[], number];

            return reply.status(200).send({
                data: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
                pagination: {
                    page,
                    pageSize,
                    total,
                    pageCount: Math.ceil(total / pageSize),
                },
            });
        }
    );
