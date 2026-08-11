import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteIntake = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/intakes/:id',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Excluir atendimento',
                operationId: 'deleteIntake',
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

            const intake = await db.intake.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!intake) {
                throw new NotFoundError('Atendimento não encontrado');
            }

            await db.intake.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
