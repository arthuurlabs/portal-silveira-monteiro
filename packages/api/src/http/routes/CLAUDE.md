# Contexto das rotas da API

Esta pasta contém as rotas HTTP da API do portal Silveira & Monteiro.

## Tecnologias e integrações

- Fastify é o servidor HTTP.
- `fastify-type-provider-zod` integra os tipos do Fastify aos schemas Zod.
- Zod valida entradas e respostas e gera os schemas do OpenAPI.
- O cliente compartilhado `db`, exportado por `src/db/prisma.ts`, acessa o banco.
- Erros HTTP conhecidos ficam em `src/http/_errors`.
- A documentação das rotas fica disponível em `/docs` e `/openapi.json`.

## Padrão geral

- Exporte uma função que recebe `FastifyInstance` e registra uma rota.
- Aplique `ZodTypeProvider` antes de chamar o método HTTP.
- Declare os schemas Zod fora da função exportada.
- Inclua `tags`, `summary`, `operationId` e `response` no schema da rota.
- Adicione `body`, `params` ou `querystring` quando a rota receber esses dados.
- Use `select` nas consultas e nunca retorne `passwordHash` ou outros dados sensíveis.
- Lance os erros de `_errors` e deixe o handler global formatar a resposta.
- Rotas privadas devem usar o mecanismo de autenticação registrado no Fastify e declarar `cookieAuth` no OpenAPI.
- Use imports ESM com extensão `.js` para arquivos internos.

## Plugin de autenticação

O plugin `src/http/plugins/auth.ts` registra o JWT no Fastify e adiciona dois métodos à requisição:

- `request.authenticate()`: valida o cookie `token`, busca o usuário no banco e preenche `request.user`. Lança `UnauthorizedError` quando o token é inválido, o usuário não existe ou está inativo.
- `request.shouldBeAdmin()`: exige que o usuário autenticado possua a role `ADMIN`. Lança `ForbiddenError` caso contrário.

O plugin deve ser registrado em `server.ts` antes das rotas que utilizam esses métodos:

```ts
await server.register(authPlugin)
await server.register(routes)
```

### Rota pública

Rotas como login e health check não usam `security` nem pre-handler de autenticação.

```ts
{
    schema: {
        tags: ['Auth'],
        summary: 'Entrar no sistema',
        operationId: 'signIn',
    },
}
```

### Rota para usuário autenticado

Declare o esquema de segurança no OpenAPI e execute `authenticate` antes do handler:

```ts
{
    schema: {
        security: [{ cookieAuth: [] }],
    },
    preHandler: [async (request) => request.authenticate()],
}
```

Depois da autenticação, o handler pode acessar os dados seguros carregados em `request.user`, como `id`, `name`, `email` e `role`. Não aceite `userId` pelo body quando a operação se refere ao próprio usuário autenticado; use `request.user.id`.

### Rota exclusiva para administrador

Execute primeiro `authenticate` e depois `shouldBeAdmin`. A ordem é obrigatória porque a verificação administrativa depende de `request.user`.

```ts
{
    schema: {
        security: [{ cookieAuth: [] }],
    },
    preHandler: [
        async (request) => request.authenticate(),
        async (request) => request.shouldBeAdmin(),
    ],
}
```

Use esse caso para operações administrativas, como criar membros, ativar ou desativar contas e alterar roles.

### Login e cookie JWT

Após validar e-mail, senha e estado do usuário, a rota de login pode emitir o token com o `id` no campo `sub`. O plugin está configurado para aceitar o JWT somente pelo cookie `token` e expirá-lo em sete dias.

```ts
const token = await reply.jwtSign({ sub: user.id })

return reply
    .setCookie('token', token, { httpOnly: true, sameSite: 'lax', path: '/' })
    .status(200)
    .send({ user })
```

Não inclua senha, hash da senha ou informações sensíveis no payload do JWT ou na resposta.

## Exemplo com User

```ts
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '../../db/prisma.js'
import { NotFoundError } from '../_errors/not-found.js'

const getUserParamsSchema = z.object({
    userId: z.cuid(),
})

const userResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    role: z.enum(['ADMIN', 'MEMBER']),
    isActive: z.boolean(),
})

export const getUser = (app: FastifyInstance) =>
    app.withTypeProvider<ZodTypeProvider>().get(
        '/users/:userId',
        {
            schema: {
                tags: ['Users'],
                summary: 'Buscar usuário',
                operationId: 'getUser',
                security: [{ cookieAuth: [] }],
                params: getUserParamsSchema,
                response: {
                    200: userResponseSchema,
                },
            },
            preHandler: [async (request) => request.authenticate()],
        },
        async (request, reply) => {
            const user = await db.user.findUnique({
                where: { id: request.params.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            })

            if (!user) {
                throw new NotFoundError('Usuário não encontrado')
            }

            return reply.status(200).send(user)
        },
    )
```

O exemplo representa o formato esperado, não uma rota que obrigatoriamente precisa existir. Adapte método, URL, schemas, autenticação e consulta à operação solicitada.

## Registro

Depois de criar uma rota, importe e registre sua função no ponto de composição usado por `src/http/server.ts`. Não deixe endpoints soltos sem registro.
