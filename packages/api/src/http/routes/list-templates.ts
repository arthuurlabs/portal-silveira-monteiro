import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { TEMPLATE_LIST_SELECT, templateListItemSchema, type TemplateListRow } from './template-schemas.js';

export const listTemplates = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/templates',
        {
            schema: {
                tags: ['Templates'],
                summary: 'Listar modelos de documento',
                operationId: 'listTemplates',
                security: [{ cookieAuth: [] }],
                response: {
                    200: z.object({
                        data: z.array(templateListItemSchema),
                    }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (_request, reply) => {
            const templates = (await db.template.findMany({
                select: TEMPLATE_LIST_SELECT,
                orderBy: { name: 'asc' },
            })) as TemplateListRow[];

            return reply.status(200).send({ data: templates });
        }
    );
