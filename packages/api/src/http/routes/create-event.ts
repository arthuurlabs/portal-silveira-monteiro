import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { eventBodySchema } from './event-schemas.js';

export const createEvent = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/events',
        {
            schema: {
                tags: ['Events'],
                summary: 'Criar evento',
                operationId: 'createEvent',
                security: [{ cookieAuth: [] }],
                body: eventBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { startAt, isGlobal, reminderMinutesBefore, ...body } = request.body;

            const event = await db.event.create({
                data: {
                    ...body,
                    userId: request.user.id,
                    startAt: new Date(startAt),
                    isGlobal: request.user.role === 'ADMIN' ? (isGlobal ?? false) : false,
                    reminderMinutesBefore: reminderMinutesBefore ?? null,
                },
                select: { id: true },
            });

            return reply.status(201).send(event);
        }
    );
