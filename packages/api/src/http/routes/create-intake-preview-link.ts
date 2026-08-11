import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import { createIntakePreviewUrl } from './intake-schemas.js';

export const createIntakePreviewLink = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/intakes/:id/preview-link',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Gerar link público de visualização do atendimento',
                operationId: 'createIntakePreviewLink',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    201: z.object({ token: z.string(), url: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const intake = await db.intake.findUnique({
                where: { id },
                select: { id: true },
            });

            if (!intake) {
                throw new NotFoundError('Atendimento não encontrado');
            }

            const { token, url } = await createIntakePreviewUrl(reply, id);

            return reply.status(201).send({ token, url });
        }
    );
