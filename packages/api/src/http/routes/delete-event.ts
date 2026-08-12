import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteEvent = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/events/:id',
        {
            schema: {
                tags: ['Events'],
                summary: 'Excluir evento',
                operationId: 'deleteEvent',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const userId = request.user.id;

            const event = await db.event.findFirst({
                where: { id, userId },
                select: { id: true },
            });

            if (!event) {
                throw new NotFoundError('Evento não encontrado');
            }

            await db.event.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
