# Contexto das rotas do dashboard

Esta pasta contém as páginas e layouts file-based do TanStack Router para o portal Silveira & Monteiro.

## Convenções do projeto

- Use `createFileRoute` para páginas e `createRootRouteWithContext` somente em `__root.tsx`.
- O plugin está configurado com `routeToken: "layout"`; arquivos `layout.tsx` representam layouts e renderizam `<Outlet />`.
- Grupos iniciados por `_`, como `_auth` e `_app`, organizam layouts sem adicionar esse trecho à URL pública.
- Use o alias `#/` para imports a partir de `src/`.
- Não edite `src/routeTree.gen.ts`; execute o gerador de rotas.
- Defina títulos e outras metatags no campo `head` da rota.
- Componentes reutilizáveis pertencem a `src/components`, não ao arquivo da rota.
- Regras de negócio e autorização pertencem à API.

## Estrutura atual

```text
routes/
├── __root.tsx
├── _app/
│   ├── layout.tsx
│   └── index.tsx
└── _auth/
    └── sign-in/
        └── index.tsx
```

- `__root.tsx`: documento HTML global, estilos, providers, scripts e metatags padrão.
- `_auth`: páginas públicas relacionadas à autenticação.
- `_app`: área interna da plataforma e ponto adequado para aplicar proteção de sessão e o shell do dashboard.

## Exemplo de página

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/profile/')({
    component: ProfileRoute,
    head: () => ({
        meta: [{ title: 'Meu perfil | Silveira & Monteiro' }],
    }),
});

function ProfileRoute() {
    return <main>Meu perfil</main>;
}
```

O caminho passado a `createFileRoute` é mantido pelo gerador. Se o TypeScript ainda não reconhecer uma rota nova, execute `npm run generate-routes`.

## Dados da API

Consuma a API pelos hooks ou clientes gerados em `#/http`. Não escreva tipos de resposta manualmente dentro da rota e não edite o código gerado.

Quando usar TanStack Query:

- prefira hooks gerados pelo Kubb;
- represente carregamento, erro e ausência de dados;
- invalide as queries relacionadas depois de mutações;
- não faça chamadas HTTP diretamente durante a renderização;
- mantenha a configuração global do cliente em `src/integrations/tanstack-query`.

## Autenticação

Páginas públicas, como login, permanecem em `_auth`. Páginas que exigem sessão pertencem a `_app`.

O layout `_app/layout.tsx` é o ponto central para:

- consultar a sessão atual;
- redirecionar visitantes não autenticados;
- renderizar navegação, cabeçalho e `<Outlet />`;
- compartilhar dados do usuário com as rotas filhas.

O redirecionamento no frontend melhora a experiência, mas cada endpoint privado também deve ser protegido pela API.

## Metatags

Cada página relevante deve fornecer um título específico. Descrições podem ser adicionadas quando fizerem sentido para a tela.

```ts
head: () => ({
    meta: [
        { title: 'Usuários | Silveira & Monteiro' },
        { name: 'description', content: 'Gerencie os usuários do portal.' },
    ],
});
```

Mantenha no `__root.tsx` apenas os metadados e recursos globais.

## Interface

- Use os componentes de `#/components/ui`.
- Use tokens semânticos definidos em `styles.css`.
- Mantenha textos em português e ações com verbos diretos.
- Garanta foco visível, labels acessíveis e navegação por teclado.
- Considere telas pequenas desde o início.
- Não concentre componentes grandes e reutilizáveis no arquivo da rota.

## Padrão de formulários

Os formulários do dashboard seguem este conjunto de ferramentas:

- `react-hook-form` para estado, submissão e erros;
- Zod para declarar o schema e inferir o tipo dos valores;
- `@hookform/resolvers/zod` para conectar Zod ao formulário;
- componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl` e `FormMessage` do design system;
- hooks de mutation gerados pelo Kubb;
- TanStack Query para atualizar ou invalidar o cache após sucesso;
- Sonner para feedback de erro e sucesso;
- `getApiErrorMessage` para extrair mensagens de erro da API.

Declare o schema fora do componente e derive o tipo com `z.infer`. Defina todos os `defaultValues`, use `form.handleSubmit`, desabilite a ação principal durante `isPending` e mantenha labels, `autoComplete` e `aria-invalid` configurados.

```tsx
const loginSchema = z.object({
    email: z.email('Informe um email válido'),
    password: z.string().min(1, 'Informe a senha'),
});

type LoginInput = z.infer<typeof loginSchema>;

export const LoginForm = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const { mutate, isPending } = useLogin({
        mutation: {
            onSuccess: (user) => {
                queryClient.setQueryData(getMeQueryOptions().queryKey, user);
                navigate({ to: '/' });
            },
            onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Não foi possível entrar'));
            },
        },
    });

    const onSubmit = (values: LoginInput) => {
        mutate({ body: values });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-invalid={Boolean(form.formState.errors.email)}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="mt-2">
                    {isPending ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
        </Form>
    );
};
```

Regras adicionais:

1. Use um `FormField` por campo controlado.
2. Mostre o erro do campo com `FormMessage`, sem duplicar mensagens manualmente.
3. Use mensagens de validação em português e orientadas à correção.
4. Use o hook gerado pelo Kubb em vez de criar mutations HTTP manualmente.
5. Em `onSuccess`, atualize o cache diretamente quando a resposta já contém o dado completo; caso contrário, invalide a query relacionada.
6. Em `onError`, prefira a mensagem retornada pela API e mantenha um fallback compreensível.
7. Não acrescente propriedades artificiais ao cache que não existam no contrato retornado pela API.
8. Separe formulários reutilizáveis da rota, mantendo a página responsável apenas pela composição.

Os imports dos hooks devem seguir o diretório atualmente gerado pelo Kubb em `#/http`. Se a configuração de saída mudar, use o novo caminho gerado e atualize este contexto.

## Componentes específicos da página

Não vão para `src/components/` — ficam co-localizados dentro da própria pasta da rota, em uma subpasta prefixada com `-` (o TanStack Router ignora qualquer arquivo ou pasta prefixado com `-` na geração de rotas):

```
routes/
└── clients/
    ├── index.tsx              # rota /clients
    ├── $clientId.tsx           # rota /clients/:clientId
    └── -components/
        ├── client-list.tsx
        ├── client-form.tsx
        └── client-status-badge.tsx
```

Use também `-hooks/`, `-queries/` dentro da pasta da rota quando fizer sentido isolar lógica específica daquela página.

## Quando criar um componente

Crie um componente quando ocorrer pelo menos um destes casos:

**Tem uma única responsabilidade bem definida**
Exemplo: `DocumentHeader` cuida somente do cabeçalho A4; `ClientCard` exibe somente o resumo de um cliente. Isso reduz acoplamento e facilita alterações.

**É reutilizado em vários locais**
Exemplo: `Button`, `PageHeader`, `ClientShell` ou `DocumentFooter`. Centralizar evita duplicação e mantém aparência e comportamento consistentes.

**Possui lógica, estado ou complexidade própria**
Mesmo usado em um único lugar, vale extrair quando possui regras independentes, eventos ou cálculos. Exemplo: `A4Document`, que mede blocos, pagina o conteúdo e controla cabeçalho e rodapé.

Regra prática:

```
Responsabilidade própria
OU reutilização
OU complexidade independente
= provável componente
```

Evite criar componentes apenas para envolver poucas tags sem lógica, sem significado próprio e sem possibilidade de reutilização.
