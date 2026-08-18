import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    PROCESS_DETAIL_SELECT,
    type ProcessDetailRow,
    processDetailSchema,
    serializeProcessDetail,
} from './process-schemas.js';

export const getProcess = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/processes/:id',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Buscar processo',
                operationId: 'getProcess',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: processDetailSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const process = (await db.process.findUnique({
                where: { id },
                select: PROCESS_DETAIL_SELECT,
            })) as ProcessDetailRow | null;

            if (!process) {
                throw new NotFoundError('Processo não encontrado');
            }

            return reply.status(200).send(serializeProcessDetail(process));
        }
    );
