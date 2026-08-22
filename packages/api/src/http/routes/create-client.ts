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
                        cpf: z.string().nullable(),
                        cnpj: z.string().nullable(),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const body = request.body;

            if (body.personType === 'JURIDICA') {
                const existingClient = await db.client.findUnique({
                    where: { cnpj: body.cnpj },
                    select: { id: true },
                });

                if (existingClient) {
                    throw new ConflictError('Já existe um cliente com este CNPJ');
                }

                const client = await db.client.create({
                    data: {
                        personType: body.personType,
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

                return reply.status(201).send(client);
            }

            const { birthDate, ...rest } = body;

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
                select: { id: true, fullName: true, cpf: true, cnpj: true },
            });

            return reply.status(201).send(client);
        }
    );
