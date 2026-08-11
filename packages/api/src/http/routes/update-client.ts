import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { ConflictError } from '../_errors/conflict.js';
import { NotFoundError } from '../_errors/not-found.js';
import { clientBodySchema } from './client-schemas.js';

export const updateClient = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/clients/:id',
        {
            schema: {
                tags: ['Clients'],
                summary: 'Atualizar cliente',
                operationId: 'updateClient',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: clientBodySchema,
                response: {
                    200: z.object({
                        id: z.string(),
                        fullName: z.string(),
                        cpf: z.string(),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const { birthDate, ...rest } = request.body;

            const existingClient = await db.client.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!existingClient) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const clientWithSameCpf = await db.client.findFirst({
                where: { cpf: rest.cpf, NOT: { id } },
                select: { id: true },
            });

            if (clientWithSameCpf) {
                throw new ConflictError('Já existe um cliente com este CPF');
            }

            const client = await db.client.update({
                where: { id },
                data: {
                    ...rest,
                    birthDate: birthDate ? new Date(birthDate) : undefined,
                },
                select: { id: true, fullName: true, cpf: true },
            });

            return reply.status(200).send(client);
        }
    );
