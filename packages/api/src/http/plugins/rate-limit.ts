import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
    });
});
