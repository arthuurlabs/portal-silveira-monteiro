import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    COMPANY_DETAIL_SELECT,
    type CompanyDetailRow,
    companyDetailSchema,
    serializeCompanyDetail,
} from './company-schemas.js';

export const listCompanies = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/clients/:clientId/companies',
        {
            schema: {
                tags: ['Companies'],
                summary: 'Listar empresas representadas pelo cliente',
                operationId: 'listCompanies',
                security: [{ cookieAuth: [] }],
                params: z.object({ clientId: z.string() }),
                response: {
                    200: z.object({
                        data: z.array(companyDetailSchema),
                    }),
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

            const companies = (await db.company.findMany({
                where: { legalRepresentativeId: clientId },
                select: COMPANY_DETAIL_SELECT,
                orderBy: { razaoSocial: 'asc' },
            })) as CompanyDetailRow[];

            return reply.status(200).send({ data: companies.map(serializeCompanyDetail) });
        }
    );
