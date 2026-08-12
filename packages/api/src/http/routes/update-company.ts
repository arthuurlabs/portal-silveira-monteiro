import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { companyBodySchema } from './company-schemas.js';

export const updateCompany = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/companies/:id',
        {
            schema: {
                tags: ['Companies'],
                summary: 'Atualizar empresa',
                operationId: 'updateCompany',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                body: companyBodySchema,
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const existingCompany = await db.company.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!existingCompany) {
                throw new NotFoundError('Empresa não encontrada');
            }

            const company = await db.company.update({
                where: { id },
                data: request.body,
                select: { id: true },
            });

            return reply.status(200).send(company);
        }
    );
