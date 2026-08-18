import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { processBodySchema } from './process-schemas.js';

export const createProcess = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/processes',
        {
            schema: {
                tags: ['Processes'],
                summary: 'Criar processo',
                operationId: 'createProcess',
                security: [{ cookieAuth: [] }],
                body: processBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const client = await db.client.findUnique({
                where: { id: request.body.clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const process = await db.process.create({
                data: {
                    ...request.body,
                    userId: request.user.id,
                },
                select: { id: true },
            });

            return reply.status(201).send(process);
        }
    );
