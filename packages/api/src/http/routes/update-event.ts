import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { eventBodySchema } from './event-schemas.js';

export const updateEvent = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/events/:id',
        {
            schema: {
                tags: ['Events'],
                summary: 'Atualizar evento',
                operationId: 'updateEvent',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: eventBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.id;

            const existingEvent = await db.event.findFirst({
                where: { id, userId },
                select: { id: true },
            });

            if (!existingEvent) {
                throw new NotFoundError('Evento não encontrado');
            }

            const { startAt, isGlobal, reminderMinutesBefore, ...body } = request.body;

            const event = await db.event.update({
                where: { id },
                data: {
                    ...body,
                    startAt: new Date(startAt),
                    isGlobal: request.user.role === 'ADMIN' ? (isGlobal ?? false) : false,
                    reminderMinutesBefore: reminderMinutesBefore ?? null,
                    reminderSentAt: null,
                },
                select: { id: true },
            });

            return reply.status(200).send(event);
        }
    );
