import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    INTAKE_DETAIL_SELECT,
    type IntakeDetailRow,
    intakeDetailSchema,
    serializeIntakeDetail,
} from './intake-schemas.js';

const listIntakesQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listIntakes = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/clients/:clientId/intakes',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Listar atendimentos do cliente',
                operationId: 'listIntakes',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                querystring: listIntakesQuerySchema,
                response: {
                    200: z.object({
                        data: z.array(intakeDetailSchema),
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
            const { clientId } = request.params;
            const { page, pageSize } = request.query;

            const client = await db.client.findUnique({
                where: { id: clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const where = { clientId };

            const [rows, total] = (await db.$transaction([
                db.intake.findMany({
                    where,
                    select: INTAKE_DETAIL_SELECT,
                    orderBy: { createdAt: 'desc' },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                db.intake.count({ where }),
            ])) as [IntakeDetailRow[], number];

            return reply.status(200).send({
                data: rows.map(serializeIntakeDetail),
                pagination: {
                    page,
                    pageSize,
                    total,
                    pageCount: Math.ceil(total / pageSize),
                },
            });
        }
    );
