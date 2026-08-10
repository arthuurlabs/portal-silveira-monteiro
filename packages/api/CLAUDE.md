# Guia da API — Silveira & Monteiro

Este documento apresenta a estrutura da API para agentes de IA e pessoas que trabalham no projeto. Antes de criar ou mover arquivos, use este mapa para localizar a responsabilidade correta.

## Visão geral

A API fica em `packages/api` e utiliza:

- Node.js com TypeScript e módulos ESM;
- Fastify como servidor HTTP;
- Zod para validação de entrada, saída e variáveis de ambiente;
- Prisma com PostgreSQL para persistência;
- Swagger/OpenAPI para documentação dos endpoints.

O ponto de entrada da aplicação é `src/http/server.ts`.

## Estrutura de pastas

```text
packages/api/
├── prisma/
├── src/
│   ├── db/
│   ├── generated/          # Criada pelo Prisma; pode não existir antes da geração
│   └── http/
│       ├── _errors/
│       ├── plugins/
│       └── routes/
├── dist/                   # Criada pelo build; não versionar nem editar
├── node_modules/           # Dependências instaladas; não editar
├── .env
├── .env.example
├── ecosystem.config.cjs
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

### `prisma/`

Centraliza a definição e o histórico do banco de dados.

- `schema.prisma`: declara os models, campos, relacionamentos e o gerador do Prisma Client.
- `migrations/`: será criada para armazenar as migrações versionadas do banco.

Alterações estruturais no PostgreSQL devem começar no `schema.prisma` e resultar em uma migração. Não escreva regras HTTP ou regras de negócio nesta pasta.

### `src/`

Contém todo o código-fonte TypeScript da API. Apenas arquivos dentro desta pasta são compilados para `dist/`.

### `src/db/`

Contém a infraestrutura de acesso ao banco de dados.

- `prisma.ts`: cria e exporta uma instância compartilhada do `PrismaClient`, usando o adaptador PostgreSQL e evitando conexões duplicadas durante o desenvolvimento.

Use o cliente exportado por esta pasta nas partes da aplicação que precisam consultar ou modificar dados. Não crie novas instâncias do Prisma dentro de rotas.

### `src/generated/`

Destino do código gerado automaticamente pelo Prisma, conforme configurado em `prisma/schema.prisma`.

- Não edite arquivos desta pasta manualmente.
- A pasta pode não existir em uma instalação nova até que o Prisma Client seja gerado.
- Quando o schema mudar, gere novamente o client em vez de corrigir o código gerado.

### `src/http/`

Contém a camada de transporte HTTP: inicialização do servidor, endpoints, plugins e tradução de erros para respostas HTTP.

- `server.ts`: configura o Fastify, registra compiladores Zod, plugins globais e rotas, e inicia o servidor na porta definida pelo ambiente.

O `server.ts` deve permanecer focado na composição da aplicação. Regras de negócio extensas não devem ser implementadas diretamente nele.

### `src/http/routes/`

Local destinado aos módulos de rotas da API.

Cada domínio funcional deve ter seu próprio módulo, por exemplo `users.ts`, `clients.ts` ou `cases.ts`. Uma rota deve:

- declarar método, URL e schemas Zod;
- extrair os dados da requisição;
- chamar a regra ou serviço responsável;
- transformar o resultado em resposta HTTP.

Evite concentrar todos os endpoints no `server.ts`. Registre os módulos desta pasta durante a composição do servidor.

### `src/http/plugins/`

Contém integrações e comportamentos globais registrados no Fastify.

- `cookie.ts`: define as opções padrão dos cookies da aplicação.
- `cors.ts`: configura origens, credenciais e métodos HTTP aceitos.
- `docs.ts`: publica o Swagger UI em `/docs` e o documento OpenAPI em `/openapi.json`.
- `error-handler.ts`: converte erros de validação, serialização e erros da aplicação em respostas HTTP consistentes.
- `rate-limit.ts`: limita a quantidade de requisições por intervalo de tempo.

Crie um plugin quando o comportamento precisar integrar-se ao ciclo de vida do Fastify ou ser compartilhado globalmente entre rotas.

### `src/http/_errors/`

Define a hierarquia de erros conhecidos da aplicação.

- `app-error.ts`: erro-base com uma mensagem e um status HTTP.
- `bad-request.ts`: requisição inválida (`400`).
- `unauthorized.ts`: autenticação ausente ou inválida (`401`).
- `forbidden.ts`: usuário autenticado sem permissão (`403`).
- `not-found.ts`: recurso inexistente (`404`).
- `conflict.ts`: conflito com o estado atual ou recurso duplicado (`409`).
- `too-many-requests.ts`: limite de requisições excedido (`429`).

Lance esses erros nas regras da aplicação quando a falha for esperada. O plugin `error-handler.ts` é responsável por convertê-los em respostas ao cliente.

### `dist/`

Saída JavaScript criada por `npm run build`.

- Não edite nem versione esta pasta.
- O arquivo executado em produção é `dist/http/server.js`.

### `node_modules/`

Dependências instaladas pelo gerenciador de pacotes. Nunca edite arquivos dessa pasta.

## Arquivos de configuração importantes

- `.env`: valores locais e sensíveis. Nunca deve ser versionado ou exibido em respostas.
- `.env.example`: relação segura das variáveis necessárias para executar a API.
- `src/env.ts`: valida as variáveis de ambiente utilizadas pela aplicação.
- `prisma.config.ts`: aponta o schema, as migrações e a conexão usada pelo Prisma CLI.
- `tsconfig.json`: configuração da compilação TypeScript de `src/` para `dist/`.
- `ecosystem.config.cjs`: configuração do processo da API no PM2.
- `package.json`: dependências e comandos de desenvolvimento, build e execução.

## Regras de organização

1. Não edite código gerado em `src/generated/` nem artefatos em `dist/`.
2. Não acesse `process.env` diretamente fora de `src/env.ts`; acrescente a variável ao schema e use o objeto `env` validado.
3. Não crie instâncias adicionais de `PrismaClient`; reutilize `src/db/prisma.ts`.
4. Mantenha schemas de entrada e saída junto ao domínio que os utiliza e exponha-os nas rotas para alimentar o OpenAPI.
5. Use erros de `src/http/_errors/` para falhas esperadas e preserve o tratamento centralizado.
6. Mantenha o `server.ts` como raiz de composição, registrando nele plugins e módulos de rotas.
7. Nunca registre segredos, tokens, cookies ou dados jurídicos sensíveis nos logs.

## Fluxo de uma requisição

```text
Cliente
  → plugin global do Fastify
  → rota em src/http/routes
  → validação Zod
  → regra da aplicação
  → Prisma em src/db
  → serialização da resposta
  → error-handler, quando houver falha
```

## Comandos principais

Execute a partir de `packages/api` ou use o workspace correspondente na raiz do monorepo.

```bash
npm run dev
npm run build
npm run start
```

- `dev`: inicia a API em modo de desenvolvimento com recarregamento automático.
- `build`: compila o TypeScript para `dist/`.
- `start`: executa o build de produção.
