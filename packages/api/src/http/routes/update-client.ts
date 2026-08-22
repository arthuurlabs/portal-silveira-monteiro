import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { BadRequestError } from '../_errors/bad-request.js';
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
                        cpf: z.string().nullable(),
                        cnpj: z.string().nullable(),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;
            const body = request.body;

            const existingClient = await db.client.findUnique({
                where: { id },
                select: { id: true, personType: true },
            });

            if (!existingClient) {
                throw new NotFoundError('Cliente não encontrado');
            }

            if (existingClient.personType !== body.personType) {
                throw new BadRequestError('Não é possível alterar o tipo de pessoa do cliente');
            }

            if (body.personType === 'JURIDICA') {
                const clientWithSameCnpj = await db.client.findFirst({
                    where: { cnpj: body.cnpj, NOT: { id } },
                    select: { id: true },
                });

                if (clientWithSameCnpj) {
                    throw new ConflictError('Já existe um cliente com este CNPJ');
                }

                const client = await db.client.update({
                    where: { id },
                    data: {
                        fullName: body.razaoSocial,
                        cnpj: body.cnpj,
                        razaoSocial: body.razaoSocial,
                        nomeFantasia: body.nomeFantasia,
                        phone: body.phone,
                        email: body.email,
                        address: body.address,
                        isActive: body.isActive,
                    },
                    select: { id: true, fullName: true, cpf: true, cnpj: true },
                });

                return reply.status(200).send(client);
            }

            const { birthDate, ...rest } = body;

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
                select: { id: true, fullName: true, cpf: true, cnpj: true },
            });

            return reply.status(200).send(client);
        }
    );
