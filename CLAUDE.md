# Contexto do monorepo — Silveira & Monteiro

Este monorepo contém o sistema interno do escritório de advocacia Silveira & Monteiro. Use este documento como mapa geral antes de alterar qualquer pacote.

## Estrutura geral

```text
portal-silveira-monteiro/
├── packages/
│   ├── api/
│   └── dashboard/
├── package.json
├── package-lock.json
├── turbo.json
└── CLAUDE.md
```

Os pacotes são workspaces npm definidos por `packages/*`. O Turborepo coordena tarefas como desenvolvimento, build, lint e checagem de tipos a partir da raiz.

## `packages/api`

Backend responsável por regras de negócio, autenticação, autorização, persistência e contrato HTTP da plataforma.

Principais tecnologias:

- Node.js e TypeScript;
- Fastify;
- Zod e `fastify-type-provider-zod`;
- Prisma com PostgreSQL;
- JWT armazenado em cookie;
- Swagger/OpenAPI.

O servidor é composto em `packages/api/src/http/server.ts`. As rotas e seus schemas alimentam o documento OpenAPI, disponibilizado pela API em `/docs` e `/openapi.json`.

Consulte `packages/api/CLAUDE.md` para a estrutura interna da API. Dentro de `src/http/routes`, consulte o `CLAUDE.md` local para o contexto de criação e autenticação de rotas.

## `packages/dashboard`

Aplicação web usada pela equipe do escritório para acessar e operar o sistema.

Principais tecnologias:

- React;
- TanStack Start e TanStack Router;
- TanStack Query;
- Vite e Nitro;
- Tailwind CSS;
- componentes baseados no padrão shadcn/ui;
- Axios;
- Kubb.

As páginas ficam em `packages/dashboard/src/routes`. O cliente base da API é configurado em `src/lib/api-client.ts`, usando `VITE_API_URL` e `withCredentials: true` para enviar o cookie de autenticação.

## Comunicação entre API e dashboard

API e dashboard não compartilham manualmente tipos de requisição e resposta. A comunicação é orientada pelo contrato OpenAPI e automatizada pelo Kubb.

```text
Schemas Zod das rotas da API
          ↓
Swagger/OpenAPI da API
          ↓
Kubb no dashboard
          ↓
packages/dashboard/src/http
          ├── types
          ├── clients
          ├── hooks
          └── zod
          ↓
Páginas e componentes do dashboard
```

### Responsabilidade da API

Cada rota da API deve declarar corretamente:

- `operationId` único e estável;
- schemas Zod de entrada;
- schemas Zod de resposta;
- status HTTP possíveis;
- tag e resumo do endpoint;
- `cookieAuth` quando a rota for privada.

Esses dados formam o contrato consumido pelo dashboard. Uma rota sem schema completo produz código cliente incompleto ou incorreto.

### Responsabilidade do Kubb

A configuração fica em `packages/dashboard/kubb.config.ts`. Atualmente o Kubb lê o OpenAPI da API em `http://localhost:3080/docs/json` e gera:

- `src/http/types`: tipos TypeScript dos contratos;
- `src/http/clients`: funções Axios para chamar endpoints;
- `src/http/hooks`: hooks do TanStack Query;
- `src/http/zod`: schemas Zod equivalentes;
- `src/http/.kubb`: infraestrutura interna do cliente gerado.

O diretório de saída usa `clean: true`. Portanto, o Kubb pode apagar e recriar todo o conteúdo de `packages/dashboard/src/http` durante a geração.

### Regras para código gerado

1. Nunca edite manualmente arquivos em `packages/dashboard/src/http`.
2. Para corrigir tipos ou contratos, altere primeiro a rota e os schemas na API.
3. Com a API em execução, gere novamente o cliente pelo Kubb no dashboard.
4. Importe nas telas os tipos, clientes e hooks gerados.
5. Código específico da interface que não é gerado deve ficar fora de `src/http`.
6. Se um `operationId` mudar, atualize todos os consumidores após regenerar o cliente.

### Fluxo para criar ou alterar um endpoint

```text
1. Alterar schema ou rota na API
2. Validar o OpenAPI exposto pela API
3. Manter a API em execução na URL esperada pelo Kubb
4. Executar o Kubb dentro de packages/dashboard
5. Usar o cliente ou hook regenerado na interface
6. Validar API e dashboard
```

O dashboard não deve duplicar manualmente interfaces que já fazem parte do contrato OpenAPI.

## Autenticação entre os pacotes

A API autentica usuários com JWT no cookie `token`. O dashboard configura o Axios com `withCredentials: true`, permitindo que o navegador envie o cookie nas requisições para a API.

- A API é responsável por emitir, validar e remover o cookie.
- O dashboard nunca deve ler ou armazenar o JWT em `localStorage`.
- Rotas privadas da API devem declarar `cookieAuth` no OpenAPI.
- CORS e cookies devem permanecer configurados para aceitar credenciais.
- Senhas, hashes e tokens nunca devem aparecer nos contratos retornados ao dashboard.

## Limites entre os pacotes

- Regras de negócio, acesso ao banco e decisões de autorização pertencem à API.
- Estado visual, navegação e interação do usuário pertencem ao dashboard.
- O dashboard não acessa o banco diretamente.
- A API não contém componentes ou regras de apresentação.
- O contrato OpenAPI, processado pelo Kubb, é a fronteira entre os dois pacotes.
- Não crie imports diretos entre `packages/api/src` e `packages/dashboard/src`.

## Arquivos da raiz

- `package.json`: define os workspaces e comandos globais.
- `package-lock.json`: mantém versões reproduzíveis das dependências de todos os pacotes.
- `turbo.json`: configura dependências, cache e persistência das tarefas.
- `.gitignore`: define artefatos que não devem ser versionados.

## Comandos gerais

Execute na raiz do monorepo:

```bash
npm run dev
npm run build
npm run lint
npm run check-types
```

- `dev`: inicia as tarefas de desenvolvimento dos workspaces.
- `build`: executa os builds respeitando as dependências entre pacotes.
- `lint`: executa os linters disponíveis.
- `check-types`: executa as checagens de tipos configuradas.

Também é possível executar comandos para um workspace específico:

```bash
npm run dev --workspace=@portalsm/api
npm run dev --workspace=dashboard
```

## Orientações para agentes de IA

1. Identifique qual pacote é responsável pela alteração antes de editar arquivos.
2. Leia o `CLAUDE.md` mais próximo do diretório em que trabalhará.
3. Preserve a fronteira OpenAPI/Kubb entre API e dashboard.
4. Não edite código gerado pelo Prisma ou pelo Kubb.
5. Não exponha arquivos `.env`, credenciais ou dados jurídicos sensíveis.
6. Ao alterar um contrato HTTP, considere o impacto nos dois pacotes.
7. Valide apenas os pacotes afetados e informe problemas preexistentes separadamente.
