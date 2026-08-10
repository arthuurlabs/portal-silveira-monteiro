import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../../env.js';

export const cookiePlugin = fp(async (app: FastifyInstance) => {
    await app.register(cookie, {
        parseOptions: {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            domain: env.NODE_ENV === 'production' ? '.portalsilveira-monteiro.com.br' : 'localhost',
        },
    });
});
