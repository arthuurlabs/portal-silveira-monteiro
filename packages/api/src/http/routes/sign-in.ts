import bcrypt from 'bcryptjs';

import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { UnauthorizedError } from '../_errors/unauthorized.js';

const signInBodySchema = z.object({
    email: z.email('Informe um email válido').trim().toLowerCase(),
    password: z.string().min(1, 'Informe a senha'),
});

export const signIn = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/auth/sign-in',
        {
            schema: {
                tags: ['Auth'],
                summary: 'Entrar no sistema',
                operationId: 'signIn',
                body: signInBodySchema,
                response: {
                    200: z.object({
                        id: z.string(),
                        name: z.string(),
                        email: z.email(),
                        role: z.enum(UserRole),
                        isActive: z.boolean(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;

            const user = await db.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    passwordHash: true,
                    role: true,
                    isActive: true,
                },
            });

            if (!user || !user.isActive) {
                throw new UnauthorizedError('Credenciais inválidas');
            }

            const passwordMatches = await bcrypt.compare(password, user.passwordHash);

            if (!passwordMatches) {
                throw new UnauthorizedError('Credenciais inválidas');
            }

            const token = await reply.jwtSign({ sub: user.id });

            return reply
                .setCookie('token', token, {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                })
                .status(200)
                .send({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                });
        }
    );
