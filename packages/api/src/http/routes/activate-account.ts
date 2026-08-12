import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { UnauthorizedError } from '../_errors/unauthorized.js';

const activateAccountBodySchema = z.object({
    token: z.string().min(1),
});

export type ActivateAccountTokenPayload = {
    type: 'activate-account';
    userId: string;
};

export const activateAccount = async (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().post(
        '/auth/activate',
        {
            schema: {
                tags: ['Auth'],
                summary: 'Ativar conta a partir do link enviado por e-mail',
                operationId: 'activateAccount',
                body: activateAccountBodySchema,
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
            const { token } = request.body;

            let payload: ActivateAccountTokenPayload;

            try {
                payload = app.jwt.verify<ActivateAccountTokenPayload>(token);
            } catch {
                throw new UnauthorizedError('Link de ativação inválido ou expirado');
            }

            if (payload.type !== 'activate-account') {
                throw new UnauthorizedError('Link de ativação inválido ou expirado');
            }

            const existingUser = await db.user.findUnique({
                where: { id: payload.userId },
                select: { id: true },
            });

            if (!existingUser) {
                throw new UnauthorizedError('Link de ativação inválido ou expirado');
            }

            const user = await db.user.update({
                where: { id: payload.userId },
                data: { isActive: true },
                select: { id: true, name: true, email: true, role: true, isActive: true },
            });

            const sessionToken = await reply.jwtSign({ sub: user.id });

            return reply.setCookie('token', sessionToken).status(200).send(user);
        }
    );
