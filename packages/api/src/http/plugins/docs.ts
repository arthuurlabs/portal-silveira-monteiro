import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export const docsPlugin = fp(async (app: FastifyInstance) => {
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'Silveira Monteiro API',
                version: '0.0.0',
            },
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'token',
                    },
                },
            },
        },
        transform: jsonSchemaTransform,
    });

    await app.register(swaggerUi, {
        routePrefix: '/docs',
    });

    app.get('/openapi.json', () => app.swagger());
});
