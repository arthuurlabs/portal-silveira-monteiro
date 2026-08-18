import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { processBodySchema } from './process-schemas.js';

export const updateProcess = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/processes/:id',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Atualizar processo',
                operationId: 'updateProcess',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: processBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const existingProcess = await db.process.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!existingProcess) {
                throw new NotFoundError('Processo não encontrado');
            }

            const client = await db.client.findUnique({
                where: { id: request.body.clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const process = await db.process.update({
                where: { id },
                data: request.body,
                select: { id: true },
            });

            return reply.status(200).send(process);
        }
    );
