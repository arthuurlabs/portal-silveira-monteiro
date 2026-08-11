import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const cookiePlugin = fp(async (app: FastifyInstance) => {
    await app.register(cookie, {
        parseOptions: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        },
    });
});
