import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { ConflictError } from '../_errors/conflict.js';
import { clientBodySchema } from './client-schemas.js';

export const createClient = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/clients',
        {
            schema: {
                tags: ['Clients'],
                summary: 'Criar cliente',
                operationId: 'createClient',
                security: [{ cookieAuth: [] }],
                body: clientBodySchema,
                response: {
                    201: z.object({
                        id: z.string(),
                        fullName: z.string(),
                        cpf: z.string(),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { birthDate, ...rest } = request.body;

            const existingClient = await db.client.findUnique({
                where: { cpf: rest.cpf },
                select: { id: true },
            });

            if (existingClient) {
                throw new ConflictError('Já existe um cliente com este CPF');
            }

            const client = await db.client.create({
                data: {
                    ...rest,
                    birthDate: birthDate ? new Date(birthDate) : undefined,
                },
                select: { id: true, fullName: true, cpf: true },
            });

            return reply.status(201).send(client);
        }
    );
