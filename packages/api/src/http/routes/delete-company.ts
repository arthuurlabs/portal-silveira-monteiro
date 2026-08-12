import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';

export const deleteCompany = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/companies/:id',
        {
            schema: {
                tags: ['Companies'],
                summary: 'Excluir empresa',
                operationId: 'deleteCompany',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: z.object({ id: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const company = await db.company.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!company) {
                throw new NotFoundError('Empresa não encontrada');
            }

            await db.company.delete({ where: { id } });

            return reply.status(200).send({ id });
        }
    );
