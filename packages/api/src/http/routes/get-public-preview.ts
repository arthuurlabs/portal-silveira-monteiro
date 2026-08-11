import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { NotFoundError } from '../_errors/not-found.js';
import {
    CLIENT_DETAIL_SELECT,
    type ClientDetailRow,
    clientDetailSchema,
    serializeClientDetail,
} from './client-schemas.js';
import {
    INTAKE_DETAIL_SELECT,
    type IntakeDetailRow,
    intakeDetailSchema,
    type PreviewTokenPayload,
    serializeIntakeDetail,
} from './intake-schemas.js';

export const getPublicPreview = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/public/preview',
        {
            schema: {
                tags: ['Preview'],
                summary: 'Buscar um documento compartilhado publicamente',
                operationId: 'getPublicPreview',
                // Token vai na querystring, não em params: o JWT (~200+ chars) passa do
                // maxParamLength padrão do find-my-way (100 chars) para parâmetros de rota.
                querystring: z.object({ token: z.string().min(1) }),
                response: {
                    200: z.object({
                        type: z.literal('intake'),
                        intake: intakeDetailSchema,
                        client: clientDetailSchema,
                    }),
                },
            },
        },
        async (request, reply) => {
            const { token } = request.query;

            let payload: PreviewTokenPayload;

            try {
                payload = app.jwt.verify<PreviewTokenPayload>(token);
            } catch {
                throw new NotFoundError('Documento não encontrado ou link expirado');
            }

            if (payload.purpose !== 'preview' || payload.type !== 'intake') {
                throw new NotFoundError('Documento não encontrado ou link expirado');
            }

            const intake = (await db.intake.findUnique({
                where: { id: payload.intakeId },
                select: INTAKE_DETAIL_SELECT,
            })) as IntakeDetailRow | null;

            if (!intake) {
                throw new NotFoundError('Documento não encontrado ou link expirado');
            }

            const client = (await db.client.findUnique({
                where: { id: intake.clientId },
                select: CLIENT_DETAIL_SELECT,
            })) as ClientDetailRow | null;

            if (!client) {
                throw new NotFoundError('Documento não encontrado ou link expirado');
            }

            return reply.status(200).send({
                type: 'intake',
                intake: serializeIntakeDetail(intake),
                client: serializeClientDetail(client),
            });
        }
    );
