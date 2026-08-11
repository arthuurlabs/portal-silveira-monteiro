import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    CLIENT_DETAIL_SELECT,
    type ClientDetailRow,
    clientDetailSchema,
    serializeClientDetail,
} from './client-schemas.js';

export const getClient = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/clients/:id',
        {
            schema: {
                tags: ['Clients'],
                summary: 'Buscar cliente',
                operationId: 'getClient',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: clientDetailSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const client = (await db.client.findUnique({
                where: { id },
                select: CLIENT_DETAIL_SELECT,
            })) as ClientDetailRow | null;

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            return reply.status(200).send(serializeClientDetail(client));
        }
    );
