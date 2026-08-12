import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { db } from '../../db/prisma.js';
import {
    serializeUserDetail,
    USER_DETAIL_SELECT,
    userDetailSchema,
    type UserDetailRow,
} from './user-schemas.js';

export const listUsers = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/users',
        {
            schema: {
                tags: ['Users'],
                summary: 'Listar usuários',
                operationId: 'listUsers',
                security: [{ cookieAuth: [] }],
                response: {
                    200: z.object({
                        data: z.array(userDetailSchema),
                    }),
                },
            },
            preHandler: [
                async (request) => request.authenticate(),
                async (request) => request.shouldBeAdmin(),
            ],
        },
        async (_request, reply) => {
            const users = (await db.user.findMany({
                select: USER_DETAIL_SELECT,
                orderBy: { name: 'asc' },
            })) as UserDetailRow[];

            return reply.status(200).send({ data: users.map(serializeUserDetail) });
        }
    );
