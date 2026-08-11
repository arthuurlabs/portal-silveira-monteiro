import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { intakeBodySchema } from './intake-schemas.js';

export const updateIntake = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/intakes/:id',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Atualizar atendimento',
                operationId: 'updateIntake',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: intakeBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const existingIntake = await db.intake.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!existingIntake) {
                throw new NotFoundError('Atendimento não encontrado');
            }

            const intake = await db.intake.update({
                where: { id },
                data: request.body,
                select: { id: true },
            });

            return reply.status(200).send(intake);
        }
    );
