import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import {
    EVENT_DETAIL_SELECT,
    type EventDetailRow,
    eventDetailSchema,
    serializeEventDetail,
} from './event-schemas.js';

export const listEvents = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/events',
        {
            schema: {
                tags: ['Events'],
                summary: 'Listar eventos visíveis para o usuário logado',
                operationId: 'listEvents',
                security: [{ cookieAuth: [] }],
                querystring: z.object({
                    from: z.iso.datetime(),
                    to: z.iso.datetime(),
                }),
                response: {
                    200: z.object({
                        data: z.array(eventDetailSchema),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { from, to } = request.query;

            const events = (await db.event.findMany({
                where: {
                    OR: [{ userId: request.user.id }, { isGlobal: true }],
                    startAt: { gte: new Date(from), lte: new Date(to) },
                },
                select: EVENT_DETAIL_SELECT,
                orderBy: { startAt: 'asc' },
            })) as EventDetailRow[];

            return reply.status(200).send({ data: events.map(serializeEventDetail) });
        }
    );
