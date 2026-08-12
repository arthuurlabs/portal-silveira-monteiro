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
import { activateAccount } from './routes/activate-account.js';
import { createClient } from './routes/create-client.js';
import { createIntake } from './routes/create-intake.js';
import { createIntakePreviewLink } from './routes/create-intake-preview-link.js';
import { createTask } from './routes/create-task.js';
import { createUser } from './routes/create-user.js';
import { deleteIntake } from './routes/delete-intake.js';
import { deleteTask } from './routes/delete-task.js';
import { getClient } from './routes/get-client.js';
import { getMe } from './routes/get-me.js';
import { getPublicPreview } from './routes/get-public-preview.js';
import { getTemplate } from './routes/get-template.js';
import { listClients } from './routes/list-clients.js';
import { listIntakes } from './routes/list-intakes.js';
import { listTasks } from './routes/list-tasks.js';
import { listTemplates } from './routes/list-templates.js';
import { listUsers } from './routes/list-users.js';
import { moveTask } from './routes/move-task.js';
import { sendIntakeEmail } from './routes/send-intake-email.js';
import { signIn } from './routes/sign-in.js';
import { signOut } from './routes/sign-out.js';
import { updateClient } from './routes/update-client.js';
import { updateIntake } from './routes/update-intake.js';
import { updateTask } from './routes/update-task.js';

const server = Fastify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

await server.register(errorHandlerPlugin);
await server.register(corsPlugin);
await server.register(cookiePlugin);
await server.register(authPlugin);
await server.register(rateLimitPlugin);
await server.register(docsPlugin);

await server.register(signIn);
await server.register(signOut);
await server.register(activateAccount);
await server.register(getMe);
await server.register(listClients);
await server.register(getClient);
await server.register(createClient);
await server.register(updateClient);
await server.register(listIntakes);
await server.register(createIntake);
await server.register(updateIntake);
await server.register(deleteIntake);
await server.register(createIntakePreviewLink);
await server.register(sendIntakeEmail);
await server.register(getPublicPreview);
await server.register(listTemplates);
await server.register(getTemplate);
await server.register(listTasks);
await server.register(createTask);
await server.register(updateTask);
await server.register(moveTask);
await server.register(deleteTask);
await server.register(createUser);
await server.register(listUsers);

server.get('/health', () => ({ status: 'ok' }));

server.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error) => {
    server.log.error(error);
    process.exit(1);
});
