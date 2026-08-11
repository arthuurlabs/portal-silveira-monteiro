import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    serializeTemplateDetail,
    TEMPLATE_DETAIL_SELECT,
    templateDetailSchema,
    type TemplateDetailRow,
} from './template-schemas.js';

export const getTemplate = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/templates/:id',
        {
            schema: {
                tags: ['Templates'],
                summary: 'Buscar modelo de documento',
                operationId: 'getTemplate',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: templateDetailSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const template = (await db.template.findUnique({
                where: { id },
                select: TEMPLATE_DETAIL_SELECT,
            })) as TemplateDetailRow | null;

            if (!template) {
                throw new NotFoundError('Modelo não encontrado');
            }

            return reply.status(200).send(serializeTemplateDetail(template));
        }
    );
