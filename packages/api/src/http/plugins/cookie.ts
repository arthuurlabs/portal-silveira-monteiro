import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../../env.js';

export const cookiePlugin = fp(async (app: FastifyInstance) => {
    const isProduction = env.NODE_ENV === 'production';

    await app.register(cookie, {
        parseOptions: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/',
            domain: isProduction ? 'portalsilveiramonteiro.com.br' : undefined,
            maxAge: 60 * 60 * 24 * 7,
        },
    });
});
