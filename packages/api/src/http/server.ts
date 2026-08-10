import 'dotenv/config';

import Fastify from 'fastify';
import {
    serializerCompiler,
    validatorCompiler,
    type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { env } from '../env.js';
import { authPlugin } from './plugins/auth.js';
import { cookiePlugin } from './plugins/cookie.js';
import { corsPlugin } from './plugins/cors.js';
import { docsPlugin } from './plugins/docs.js';
import { errorHandlerPlugin } from './plugins/error-handler.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { getMe } from './routes/get-me.js';
import { signIn } from './routes/sign-in.js';
import { signOut } from './routes/sign-out.js';

const server = Fastify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

await server.register(errorHandlerPlugin);
await server.register(corsPlugin);
await server.register(cookiePlugin);
await server.register(rateLimitPlugin);
await server.register(authPlugin);
await server.register(docsPlugin);

signIn(server);
signOut(server);
getMe(server);

server.get('/health', () => ({ status: 'ok' }));

server.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error) => {
    server.log.error(error);
    process.exit(1);
});
