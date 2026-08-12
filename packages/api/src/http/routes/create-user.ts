import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { env } from '../../env.js';
import { sendEmail } from '../../lib/email.js';
import { renderEmailTemplate } from '../../lib/render-email-template.js';
import { ConflictError } from '../_errors/conflict.js';
import type { ActivateAccountTokenPayload } from './activate-account.js';
import { userCreateBodySchema } from './user-schemas.js';

const ACTIVATION_TOKEN_EXPIRATION = '7d';

export const createUser = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/users',
        {
            schema: {
                tags: ['Users'],
                summary: 'Cadastrar usuário',
                operationId: 'createUser',
                security: [{ cookieAuth: [] }],
                body: userCreateBodySchema,
                response: {
                    201: z.object({ id: z.string() }),
                },
            },
            preHandler: [
                async (request) => request.authenticate(),
                async (request) => request.shouldBeAdmin(),
            ],
        },
        async (request, reply) => {
            const { name, email, role } = request.body;

            const existingUser = await db.user.findUnique({
                where: { email },
                select: { id: true },
            });

            if (existingUser) {
                throw new ConflictError('Já existe um usuário com este e-mail');
            }

            const passwordHash = await bcrypt.hash(env.DEFAULT_USER_PASSWORD, 12);

            const user = await db.user.create({
                data: { name, email, role, passwordHash, isActive: false },
                select: { id: true, name: true, email: true },
            });

            const token = await reply.jwtSign(
                { type: 'activate-account', userId: user.id } satisfies ActivateAccountTokenPayload,
                { expiresIn: ACTIVATION_TOKEN_EXPIRATION }
            );
            const activationUrl = `${env.DASHBOARD_URL}/activate/${token}`;

            await sendEmail({
                to: user.email,
                subject: 'Ative sua conta — Silveira & Monteiro',
                html: renderEmailTemplate('account-activation.html', {
                    name: user.name,
                    activationUrl,
                }),
            });

            return reply.status(201).send({ id: user.id });
        }
    );
