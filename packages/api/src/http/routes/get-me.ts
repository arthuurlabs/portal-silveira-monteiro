import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { UserRole } from '../../generated/prisma/enums.js';

export const getMe = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/auth/me',
        {
            schema: {
                tags: ['Auth'],
                summary: 'Buscar usuário autenticado',
                operationId: 'getMe',
                security: [{ cookieAuth: [] }],
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
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => reply.status(200).send(request.user)
    );
