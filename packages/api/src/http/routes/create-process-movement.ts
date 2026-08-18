import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { processMovementBodySchema } from './process-movement-schemas.js';

export const createProcessMovement = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/processes/:processId/movements',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Criar movimentação do processo',
                operationId: 'createProcessMovement',
                security: [{ cookieAuth: [] }],
                params: z.object({ processId: z.string() }),
                body: processMovementBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { processId } = request.params;

            const process = await db.process.findUnique({
                where: { id: processId },
                select: { id: true },
            });

            if (!process) {
                throw new NotFoundError('Processo não encontrado');
            }

            const movement = await db.processMovement.create({
                data: {
                    ...request.body,
                    occurredAt: new Date(request.body.occurredAt),
                    processId,
                },
                select: { id: true },
            });

            return reply.status(201).send(movement);
        }
    );
