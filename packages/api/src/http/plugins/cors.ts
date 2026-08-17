import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../../env.js';

export const corsPlugin = fp(async (app: FastifyInstance) => {
    const isProduction = env.NODE_ENV === 'production';

    await app.register(cors, {
        origin: isProduction ? 'https://portalsilveiramonteiro.com.br' : 'http://localhost:3000',

        credentials: true,

        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
});
