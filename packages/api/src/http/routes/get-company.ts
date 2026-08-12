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

export const getCompany = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/companies/:id',
        {
            schema: {
                tags: ['Companies'],
                summary: 'Buscar empresa',
                operationId: 'getCompany',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: companyDetailSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const company = (await db.company.findUnique({
                where: { id },
                select: COMPANY_DETAIL_SELECT,
            })) as CompanyDetailRow | null;

            if (!company) {
                throw new NotFoundError('Empresa não encontrada');
            }

            return reply.status(200).send(serializeCompanyDetail(company));
        }
    );
