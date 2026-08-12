import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { ConflictError } from '../_errors/conflict.js';
import { NotFoundError } from '../_errors/not-found.js';
import { companyBodySchema } from './company-schemas.js';

export const createCompany = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/clients/:clientId/companies',
        {
            schema: {
                tags: ['Companies'],
                summary: 'Cadastrar empresa representada pelo cliente',
                operationId: 'createCompany',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                body: companyBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { clientId } = request.params;

            const client = await db.client.findUnique({
                where: { id: clientId },
                select: { id: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            const existingCompany = await db.company.findUnique({
                where: { cnpj: request.body.cnpj },
                select: { id: true },
            });

            if (existingCompany) {
                throw new ConflictError('Já existe uma empresa com este CNPJ');
            }

            const company = await db.company.create({
                data: {
                    ...request.body,
                    legalRepresentativeId: clientId,
                },
                select: { id: true },
            });

            return reply.status(201).send(company);
        }
    );
