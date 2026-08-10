# Contexto do dashboard

Este pacote contém a aplicação web do portal Silveira & Monteiro. Ele oferece a interface usada pela equipe do escritório e consome a API do monorepo por meio do cliente gerado pelo Kubb.

## Tecnologias principais

- React;
- TanStack Start e TanStack Router;
- TanStack Query;
- Vite e Nitro;
- Tailwind CSS;
- componentes no padrão shadcn/ui;
- Axios;
- Kubb;
- Zod;
- Biome.

## Estrutura

```text
packages/dashboard/
├── src/
│   ├── components/
│   │   └── ui/
│   ├── http/
│   │   ├── .kubb/
│   │   ├── clients/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── zod/
│   ├── integrations/
│   │   └── tanstack-query/
│   ├── lib/
│   ├── routes/
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   └── styles.css
├── components.json
├── kubb.config.ts
├── package.json
├── tsconfig.json
├── tsr.config.json
└── vite.config.ts
```

## `src/components/`

Contém componentes reutilizáveis da interface.

- `components/ui`: componentes básicos do design system, como botões, campos, badges e cards.
- Componentes específicos de uma funcionalidade podem ser agrupados em outras pastas dentro de `components`.

Antes de criar um novo componente básico, verifique se já existe uma implementação em `components/ui`. Preserve os tokens semânticos e os estados de foco definidos pelo design system.

## `src/http/`

Contém código gerado automaticamente pelo Kubb a partir do OpenAPI da API.

- `.kubb`: infraestrutura interna do cliente Axios gerado;
- `types`: tipos TypeScript de entradas e respostas;
- `clients`: funções Axios para os endpoints;
- `hooks`: hooks do TanStack Query;
- `zod`: schemas Zod derivados do contrato.

Não edite arquivos desta pasta manualmente. O diretório é limpo e recriado durante a geração.

Quando um tipo, endpoint ou schema estiver incorreto:

1. corrija a rota correspondente em `packages/api`;
2. confirme o OpenAPI publicado pela API;
3. execute o Kubb novamente;
4. atualize o código da interface que consome o contrato.

## Comunicação com a API

O fluxo entre os pacotes é:

```text
API Fastify + schemas Zod
        → OpenAPI
        → Kubb
        → tipos, clientes, hooks e schemas em src/http
        → páginas e componentes do dashboard
```

A configuração está em `kubb.config.ts`. O Kubb lê a especificação da API em `http://localhost:3080/docs/json`.

`src/lib/api-client.ts` configura o cliente gerado com:

- `VITE_API_URL` como URL base;
- `withCredentials: true` para envio do cookie de autenticação.

Não duplique interfaces que já são geradas pelo Kubb e não faça requisições Axios paralelas ao cliente gerado sem uma necessidade explícita.

## `src/integrations/`

Contém integrações de infraestrutura do frontend. Atualmente concentra a criação do `QueryClient`, seus padrões de cache e ferramentas de desenvolvimento do TanStack Query.

## `src/lib/`

Contém utilitários e configurações compartilhadas que não são componentes nem rotas.

- `api-client.ts`: inicializa o cliente Kubb/Axios;
- `utils.ts`: disponibiliza utilitários de classes, incluindo `cn`.

## `src/routes/`

Contém as rotas file-based do TanStack Router. Layouts, páginas, loaders, validação de busca e metatags ficam nesta pasta.

Consulte `src/routes/CLAUDE.md` antes de criar ou alterar uma rota.

## Arquivos gerados

- `src/routeTree.gen.ts`: gerado pelo TanStack Router;
- todo o conteúdo de `src/http`: gerado pelo Kubb.

Nunca edite esses arquivos manualmente. Altere suas fontes e execute os geradores correspondentes.

## Estilos e design system

`src/styles.css` contém:

- importação do Tailwind;
- tokens semânticos de cores;
- temas claro e escuro;
- tipografia;
- raios, sombras e estilos globais.

Use classes semânticas como `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground` e `border-border`. Evite inserir cores hexadecimais diretamente em páginas e componentes quando já existir um token adequado.

`components.json` configura o shadcn/ui e seus aliases. Os imports internos utilizam preferencialmente o alias `#/`, que aponta para `src/`.

## Autenticação

A API mantém o JWT em um cookie HTTP-only chamado `token`. O dashboard envia esse cookie automaticamente pelo cliente configurado com credenciais.



## Arquivos de configuração

- `vite.config.ts`: plugins do Vite, TanStack Start, Nitro, React e Tailwind;
- `tsr.config.json`: configuração do gerador de rotas;
- `kubb.config.ts`: entrada OpenAPI e geradores do cliente HTTP;
- `components.json`: configuração dos componentes shadcn/ui;
- `biome.json`: formatação e lint;
- `tsconfig.json`: TypeScript e aliases;
- `.env`: valores locais, incluindo `VITE_API_URL`.

## Comandos

Execute dentro de `packages/dashboard`:

```bash
npm run dev
npm run build
npm run generate-routes
npm run check
```

Para regenerar o cliente da API, mantenha a API ativa na URL configurada em `kubb.config.ts` e execute o Kubb pelo CLI instalado no pacote.

## Orientações para agentes de IA

1. Leia o `CLAUDE.md` da raiz do monorepo e o arquivo local mais próximo.
2. Não edite código gerado pelo Kubb ou pelo TanStack Router.
3. Preserve a separação entre interface, acesso HTTP e regras da API.
4. Use os componentes e tokens existentes antes de criar alternativas.
5. Considere SSR ao acessar `window`, `document`, cookies ou armazenamento do navegador.
6. Mantenha textos da interface em português claro e orientado à ação.
7. Valide responsividade, foco por teclado e estados de carregamento, vazio e erro.
