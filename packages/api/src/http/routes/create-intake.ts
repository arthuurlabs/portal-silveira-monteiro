import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { intakeBodySchema } from './intake-schemas.js';

export const createIntake = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/clients/:clientId/intakes',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Criar atendimento',
                operationId: 'createIntake',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                body: intakeBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { clientId } = request.params;

            const client = await db.client.findUnique({
                where: { id: clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const intake = await db.intake.create({
                data: {
                    ...request.body,
                    clientId,
                    userId: request.user.id,
                },
                select: { id: true },
            });

            return reply.status(201).send(intake);
        }
    );
