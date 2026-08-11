import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { BadRequestError } from '../_errors/bad-request.js';
import { NotFoundError } from '../_errors/not-found.js';
import { sendEmail } from '../../lib/email.js';
import { createIntakePreviewUrl } from './intake-schemas.js';

export const sendIntakeEmail = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/intakes/:id/send',
        {
            schema: {
                tags: ['Intakes'],
                summary: 'Enviar a ficha do atendimento por e-mail ao cliente',
                operationId: 'sendIntakeEmail',
                security: [{ cookieAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: z.object({ sentTo: z.string() }),
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const { id } = request.params;

            const intake = await db.intake.findUnique({
                where: { id },
                select: { id: true, clientId: true },
            });

            if (!intake) {
                throw new NotFoundError('Atendimento não encontrado');
            }

            const client = await db.client.findUnique({
                where: { id: intake.clientId },
                select: { fullName: true, email: true },
            });

            if (!client) {
                throw new NotFoundError('Cliente não encontrado');
            }

            if (!client.email) {
                throw new BadRequestError('Cliente não possui e-mail cadastrado');
            }

            const { url } = await createIntakePreviewUrl(reply, id);

            await sendEmail({
                to: client.email,
                subject: 'Ficha de atendimento — Silveira & Monteiro',
                html: `<p>Olá, ${client.fullName}.</p><p>Segue o link da sua ficha de atendimento:</p><p><a href="${url}">${url}</a></p>`,
            });

            return reply.status(200).send({ sentTo: client.email });
        }
    );
