import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    PROCESS_MOVEMENT_DETAIL_SELECT,
    type ProcessMovementDetailRow,
    processMovementDetailSchema,
    serializeProcessMovementDetail,
} from './process-movement-schemas.js';

export const listProcessMovements = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/processes/:processId/movements',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Listar movimentações do processo',
                operationId: 'listProcessMovements',
                security: [{ cookieAuth: [] }],
                params: z.object({ processId: z.string() }),
                response: {
                    200: z.object({
                        data: z.array(processMovementDetailSchema),
                    }),
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

            const movements = (await db.processMovement.findMany({
                where: { processId },
                select: PROCESS_MOVEMENT_DETAIL_SELECT,
                orderBy: { occurredAt: 'desc' },
            })) as ProcessMovementDetailRow[];

            return reply.status(200).send({
                data: movements.map(serializeProcessMovementDetail),
            });
        }
    );
