import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import {
    hasZodFastifySchemaValidationErrors,
    isResponseSerializationError,
} from 'fastify-type-provider-zod';

import { AppError } from '../_errors/app-error.js';

export const errorHandlerPlugin = fp(async (app: FastifyInstance) => {
    app.setErrorHandler((error, request, reply) => {
        if (hasZodFastifySchemaValidationErrors(error)) {
            return reply.status(400).send({
                message: 'Erro de validação',
                issues: error.validation,
            });
        }

        if (isResponseSerializationError(error)) {
            request.log.error(error);

            return reply.status(500).send({ message: 'Erro interno do servidor' });
        }

        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ message: error.message });
        }

        request.log.error(error);

        return reply.status(500).send({ message: 'Erro interno do servidor' });
    });
});
