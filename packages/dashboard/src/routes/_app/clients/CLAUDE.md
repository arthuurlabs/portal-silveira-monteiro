# Contexto das rotas de clientes

Esta pasta reúne as rotas do módulo de clientes.

Use `index.tsx` como entrada e listagem do módulo. Coloque em `$client_id/` todas as páginas relacionadas a um cliente específico.

## Estrutura prevista

A árvore pode crescer conforme novas áreas do cliente forem implementadas:

```text
clients/
├── index.tsx
└── $client_id/
    ├── index.tsx
    ├── intakes/
    ├── files/
    └── templates/
```

Use `$client_id/index.tsx` como visão geral do cliente.

Mantenha `intakes`, `files`, `templates` e outras áreas vinculadas ao cliente dentro de `$client_id/`.

## Pessoa física e jurídica

Não existe mais uma entidade separada de "empresa". Todo `Client` possui um campo `personType` (`FISICA` ou `JURIDICA`), que determina quais campos são relevantes:

```text
FISICA   → fullName, cpf, rg, birthDate, maritalStatus, profession
JURIDICA → razaoSocial, cnpj, nomeFantasia
```

Campos compartilhados pelos dois tipos: `phone`, `email`, `address`, `isActive`.

`personType` é imutável após a criação do cliente — a API rejeita alterações desse campo em `updateClient`.

Ramifique a interface por `client.personType` em vez de reintroduzir uma rota ou entidade separada para pessoa jurídica.

---

## Rota pai `$client_id`

A rota:

```text
/_app/clients/$client_id
```

é responsável por centralizar o carregamento do cliente atual.

O cliente deve ser carregado no `loader` da rota pai usando o `queryClient` disponível no contexto do TanStack Router.

Exemplo:

```tsx
export const Route = createFileRoute('/_app/clients/$client_id')({
    loader: async ({ context, params }) => {
        try {
            const client = await context.queryClient.ensureQueryData({
                ...getClientQueryOptions({
                    path: { id: params.client_id },
                }),
                retry: false,
            });

            return { client };
        } catch (error) {
            if (error instanceof ResponseError && error.status === 404) {
                throw redirect({
                    to: '/clients',
                });
            }

            throw error;
        }
    },

    component: ClientLayout,
});
```

Não buscar novamente o cliente individualmente em cada rota filha.

Evite:

```tsx
const { data: client } = useGetClient({
    path: { id: client_id },
});
```

quando o cliente já estiver sendo carregado pelo `loader` de `$client_id`.

---

## Acesso ao cliente nas rotas filhas

O cliente carregado pelo `loader` da rota pai não faz parte do `Route Context`.

Portanto, as rotas filhas não devem usar:

```tsx
const { client } = Route.useRouteContext();
```

nem:

```tsx
const client = Route.useRouteContext();
```

Para acessar o cliente atual, use `getRouteApi` apontando para a rota pai:

```tsx
import { createFileRoute, getRouteApi } from '@tanstack/react-router';

const clientRoute = getRouteApi('/_app/clients/$client_id');
```

Dentro do componente:

```tsx
const { client } = clientRoute.useLoaderData();
```

Este é o padrão obrigatório para todas as rotas abaixo de:

```text
/_app/clients/$client_id
```

Exemplo:

```tsx
const clientRoute = getRouteApi('/_app/clients/$client_id');

const ClientIntakesRoute = () => {
    const { client } = clientRoute.useLoaderData();

    return <div>{client.fullName}</div>;
};
```

---

## Separação entre `beforeLoad` e `loader`

Não usar `beforeLoad` para carregamento normal dos dados do cliente.

Use `beforeLoad` apenas para responsabilidades relacionadas à navegação, como:

- autenticação;
- autorização;
- validação de acesso;
- redirects;
- enriquecimento real do `Route Context`, quando necessário.

Use `loader` para buscar os dados necessários para a rota.

Regra:

```text
beforeLoad
→ posso entrar nesta rota?

loader
→ quais dados esta rota precisa?
```

O carregamento do cliente pertence ao `loader`.

---

## TanStack Query no loader

Dentro de `loader` e `beforeLoad`, não usar hooks React.

Nunca usar:

```tsx
useQuery(...)
```

```tsx
useSuspenseQuery(...)
```

```tsx
useGetClient(...)
```

Esses hooks só podem ser usados durante a renderização de componentes React.

No `loader`, usar APIs imperativas do `QueryClient`, preferencialmente:

```tsx
context.queryClient.ensureQueryData(...)
```

Exemplo:

```tsx
const client = await context.queryClient.ensureQueryData(
    getClientQueryOptions({
        path: { id: params.client_id },
    })
);
```

---

## Queries específicas das rotas filhas

O fato de o cliente ser carregado no `loader` pai não significa que todas as queries das rotas filhas devem ser movidas para ele.

Mantenha queries específicas da página dentro da própria rota ou componente quando apropriado.

Exemplo em `intakes`:

```tsx
const { client } = clientRoute.useLoaderData();

const { data, isPending, isError } = useListIntakes({
    path: {
        clientId: client.id,
    },
    query: {
        page: 1,
        pageSize: 50,
    },
});
```

Exemplo em `files`:

```tsx
const { client } = clientRoute.useLoaderData();

const { data, isPending, isError } = useListDocuments({
    path: {
        clientId: client.id,
    },
});
```

Exemplo em `templates`:

```tsx
const { client } = clientRoute.useLoaderData();

const { data, isPending, isError } = useListTemplates();
```

A divisão deve ser:

```text
$client_id loader
└── dados estruturais do cliente

intakes
└── dados de atendimentos

files
└── dados de documentos

templates
└── dados de modelos
```

Não carregar no layout pai dados que pertencem exclusivamente a uma rota filha.

---

## Redirecionamento para cliente inexistente

Quando o `client_id` não existir, redirecionar para a listagem de clientes.

Não é necessário criar `notFoundComponent` para esse fluxo.

Use:

```tsx
if (error instanceof ResponseError && error.status === 404) {
    throw redirect({
        to: '/clients',
    });
}
```

O objetivo é proteger também acessos diretos por URL, bookmarks antigos e identificadores inválidos.

---

## Erros HTTP

Não transformar todos os erros em redirect para `/clients`.

Tratar cada situação conforme sua responsabilidade.

```text
404
→ cliente não existe
→ /clients

401
→ problema de autenticação
→ deve ser tratado preferencialmente pela rota protegida superior

403
→ usuário não possui acesso

500+
→ erro da aplicação/API
→ deixar subir para o error boundary apropriado
```

Não esconder erros inesperados.

Após tratar os casos conhecidos, relançar o erro:

```tsx
throw error;
```

---

## HttpOnly e loaders

A autenticação da aplicação utiliza cookie HttpOnly.

O `loader` não deve tentar ler o cookie diretamente.

Não usar:

```tsx
document.cookie;
```

para autenticação.

O client HTTP usado pelas queries do Kubb deve estar configurado para enviar credenciais desde sua criação.

Exemplo com Axios:

```tsx
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});
```

Não configurar `withCredentials` somente dentro de componente React, `useEffect` ou Provider que execute após o Router.

Os loaders podem executar antes da renderização dos componentes.

---

## Loading

Quando os dados essenciais da rota forem carregados através de `loader`, não criar loading manual apenas para esses mesmos dados dentro do componente.

Evite:

```tsx
if (!client) {
    return null;
}
```

e evite repetir:

```tsx
if (isLoading) {
    return <Skeleton />;
}
```

para o cliente carregado pelo loader.

Se for necessário mostrar estado visual durante a navegação, prefira configurar o estado de loading no próprio TanStack Router através de `pendingComponent`.

Queries secundárias específicas da página podem continuar utilizando normalmente:

```tsx
isPending;
isError;
```

---

## Regra para novas rotas do grupo

Sempre que uma nova rota for criada dentro de:

```text
clients/$client_id/
```

e precisar acessar o cliente atual, usar:

```tsx
const clientRoute = getRouteApi('/_app/clients/$client_id');

const { client } = clientRoute.useLoaderData();
```

Não criar uma nova query de cliente.

Não usar `Route.useRouteContext()` esperando encontrar `client`.

Não criar React Context, Zustand ou outro estado global apenas para distribuir o cliente dentro dessa árvore de rotas.

A rota `$client_id` já é responsável por resolver esse recurso.

---

## Resumo obrigatório

Para este grupo de rotas, seguir esta arquitetura:

```text
/_app
└── beforeLoad
    └── autenticação/autorização

/clients/$client_id
└── loader
    └── ensureQueryData(client)

/clients/$client_id/*
└── getRouteApi("/_app/clients/$client_id")
    └── useLoaderData()
        └── client
```

Responsabilidades:

```text
Route Context
→ dependências globais ou compartilhadas pela árvore

beforeLoad
→ guards, auth, permissões e redirects

loader
→ dados necessários para a rota

ensureQueryData
→ garantir dados no cache do TanStack Query

useLoaderData
→ acessar os dados carregados pela rota pai

hooks do Kubb / useQuery
→ queries específicas e reativas dos componentes
```

Manter essa separação em todas as implementações e refatorações dentro do módulo de clientes.
