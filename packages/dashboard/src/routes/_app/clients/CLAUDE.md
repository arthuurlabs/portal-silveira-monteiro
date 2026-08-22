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
    └── files/
```

Use `$client_id/index.tsx` como visão geral do cliente.

Mantenha `intakes`, `files` e outras áreas vinculadas ao cliente dentro de `$client_id/`.

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

## Carregamento de dados: só hooks do Kubb, sem `loader`/`beforeLoad`

Este módulo não usa `loader` nem `beforeLoad` do TanStack Router para buscar dados. Toda busca de dado — incluindo o cliente atual — acontece via hooks do Kubb chamados diretamente no componente, igual ao padrão já usado em `_app/layout.tsx` (`useGetMe()`).

Não criar `loader`/`beforeLoad` com `ensureQueryData` para carregar o cliente, atendimentos, documentos ou qualquer outro dado deste módulo.

`beforeLoad` continua reservado para guards que não buscam dado nenhum (ex.: nada neste módulo precisa disso hoje — a autenticação já é resolvida em `_app/layout.tsx`).

---

## Acesso ao cliente atual em qualquer rota do grupo

Toda rota abaixo de:

```text
/_app/clients/$client_id
```

— incluindo o próprio `$client_id/layout.tsx` — pega o `client_id` do próprio `Route.useParams()` e chama `useGetClient` diretamente:

```tsx
import { createFileRoute } from '@tanstack/react-router';

import { useGetClient } from '#/http/hooks/useGetClient';

const ClientIntakesRoute = () => {
    const { client_id } = Route.useParams();
    const { data: client } = useGetClient({ path: { id: client_id } });

    if (!client) {
        return null;
    }

    return <div>{client.fullName}</div>;
};
```

Não usar `getRouteApi(...).useLoaderData()`, `Route.useLoaderData()` nem `Route.useRouteContext()` para obter o cliente — essas APIs pressupõem um `loader`/`beforeLoad` que este módulo não tem.

Não criar React Context, Zustand ou outro estado global só para distribuir o cliente entre `$client_id/layout.tsx` e suas rotas filhas.

Como a query key de `useGetClient` é a mesma (`path: { id: client_id }}`) em toda a árvore, chamar o hook em vários componentes ao mesmo tempo não gera requisições de rede duplicadas — o TanStack Query compartilha o cache pela chave. Cada componente só precisa lidar com seu próprio `isPending`/`isError`/guard de `undefined`.

O guard `if (!client) return null;` é esperado e correto aqui — ele só resolve a tipagem (`Client | undefined`) do hook, não indica um problema de arquitetura.

---

## Ordem dos hooks

Como não há mais `loader` populando dados antes da renderização, `$client_id/layout.tsx` e as rotas filhas plotam estados de carregamento (`Skeleton`) e redirecionamento (`<Navigate />`) dentro do próprio componente, sempre **depois** de todos os hooks (`useGetClient`, `useListIntakes`, `useListDocuments`, mutations, etc.) terem sido chamados — nunca antes, pra não violar a ordem de hooks do React.

Quando uma query secundária depende do cliente já ter sido resolvido (ex.: `useListIntakes` precisa de `client.id`), use `enabled` em vez de condicionar a própria chamada do hook:

```tsx
const { data: client } = useGetClient({ path: { id: client_id } });

const { data, isPending, isError } = useListIntakes(
    { path: { clientId: client_id }, query: { page: 1, pageSize: 50 } },
    { query: { enabled: Boolean(client) } }
);

if (!client) {
    return null;
}
```

---

## Cliente inexistente

Quando `useGetClient` retornar erro (inclui 404) ou `data` vier `undefined` depois de resolvido, redirecionar para a listagem de clientes com `<Navigate />`:

```tsx
const { data: client, isPending, isError } = useGetClient({ path: { id: client_id } });

if (isPending) {
    return <Skeleton className="h-24 w-full" />;
}

if (isError || !client) {
    return <Navigate to="/clients" replace />;
}
```

Isso substitui o antigo redirect de `loader`; o efeito para o usuário é o mesmo (acesso direto por URL, bookmark antigo ou id inválido cai em `/clients`).

---

## HttpOnly

A autenticação da aplicação utiliza cookie HttpOnly. O client HTTP usado pelas queries do Kubb deve estar configurado para enviar credenciais desde sua criação (`withCredentials: true` em `src/lib/api-client.ts`) — isso independe de loader ou hook, é configuração do cliente Axios.

---

## Regra para novas rotas do grupo

Sempre que uma nova rota for criada dentro de:

```text
clients/$client_id/
```

e precisar do cliente atual, chamar `useGetClient({ path: { id: client_id } })` diretamente no componente, pegando `client_id` de `Route.useParams()`. Não criar loader, não usar `getRouteApi`/`useLoaderData`, não criar Context.
