import 'dotenv/config';

import multipart from '@fastify/multipart';
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
import { createCompany } from './routes/create-company.js';
import { createTask } from './routes/create-task.js';
import { createUser } from './routes/create-user.js';
import { deleteCompany } from './routes/delete-company.js';
import { deleteDocument } from './routes/delete-document.js';
import { deleteIntake } from './routes/delete-intake.js';
import { deleteTask } from './routes/delete-task.js';
import { downloadDocument } from './routes/download-document.js';
import { getClient } from './routes/get-client.js';
import { getCompany } from './routes/get-company.js';
import { getMe } from './routes/get-me.js';
import { getPublicPreview } from './routes/get-public-preview.js';
import { getTemplate } from './routes/get-template.js';
import { listClients } from './routes/list-clients.js';
import { listCompanies } from './routes/list-companies.js';
import { listDocuments } from './routes/list-documents.js';
import { listIntakes } from './routes/list-intakes.js';
import { listTasks } from './routes/list-tasks.js';
import { listTemplates } from './routes/list-templates.js';
import { listUsers } from './routes/list-users.js';
import { moveTask } from './routes/move-task.js';
import { sendIntakeEmail } from './routes/send-intake-email.js';
import { signIn } from './routes/sign-in.js';
import { signOut } from './routes/sign-out.js';
import { updateClient } from './routes/update-client.js';
import { updateCompany } from './routes/update-company.js';
import { updateIntake } from './routes/update-intake.js';
import { updateTask } from './routes/update-task.js';
import { uploadDocument } from './routes/upload-document.js';
import { MAX_DOCUMENT_SIZE_BYTES } from './routes/document-schemas.js';

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
await server.register(multipart, {
    limits: { fileSize: MAX_DOCUMENT_SIZE_BYTES },
});

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
await server.register(listCompanies);
await server.register(getCompany);
await server.register(createCompany);
await server.register(updateCompany);
await server.register(deleteCompany);
await server.register(listDocuments);
await server.register(uploadDocument);
await server.register(downloadDocument);
await server.register(deleteDocument);

server.get('/health', () => ({ status: 'ok' }));

server.listen({ port: env.PORT, host: '0.0.0.0' }).catch((error) => {
    server.log.error(error);
    process.exit(1);
});
