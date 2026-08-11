# Contexto das rotas do dashboard

Esta pasta contém as páginas e os layouts file-based do TanStack Router para o portal Silveira & Monteiro. Use este documento como referência para criar rotas, consumir a API, montar formulários e organizar componentes.

## Convenções do projeto

- Use `createFileRoute` para páginas
- Use `createRootRouteWithContext` somente em `__root.tsx`
- Use o alias `#/` para imports a partir de `src/`
- Não edite `src/routeTree.gen.ts`; execute o gerador de rotas
- Defina títulos e outras metatags no campo `head` da rota
- Mantenha componentes reutilizáveis em `src/components`
- Mantenha regras de negócio e autorização na API

## Estrutura das rotas

O plugin usa `routeToken: "layout"`. Por isso, arquivos `layout.tsx` representam layouts e renderizam `<Outlet />`. Grupos iniciados por `_`, como `_auth` e `_app`, organizam layouts sem adicionar esse trecho à URL pública.

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

Cada parte da estrutura tem uma responsabilidade:

- `__root.tsx`: documento HTML global, estilos, providers, scripts e metatags padrão
- `_auth`: páginas públicas relacionadas à autenticação
- `_app`: área interna, proteção de sessão e shell do dashboard

## Criação de páginas

Crie cada página com `createFileRoute` e mantenha o arquivo da rota focado na composição da tela.

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

O gerador mantém o caminho passado a `createFileRoute`. Se o TypeScript não reconhecer uma rota nova, execute `npm run generate-routes`.

### Metatags das páginas

Cada página relevante deve fornecer um título específico. Adicione uma descrição quando ela ajudar a identificar o conteúdo da tela.

```ts
head: () => ({
    meta: [
        { title: 'Usuários | Silveira & Monteiro' },
        {
            name: 'description',
            content: 'Gerencie os usuários do portal.',
        },
    ],
});
```

Mantenha em `__root.tsx` apenas os metadados e recursos globais.

## Autenticação e autorização

Mantenha páginas públicas, como o login, em `_auth`. Coloque páginas que exigem sessão em `_app`.

Use `_app/layout.tsx` para:

- consultar a sessão atual
- redirecionar visitantes não autenticados
- renderizar navegação, cabeçalho e `<Outlet />`
- compartilhar dados do usuário com as rotas filhas

O redirecionamento no frontend melhora a experiência. Proteja também cada endpoint privado na API.

## Dados da API

Consuma a API pelos hooks ou clientes gerados em `#/http`. Não declare tipos de resposta manualmente dentro da rota e não edite o código gerado.

Ao usar TanStack Query:

- prefira os hooks gerados pelo Kubb
- represente carregamento, erro e ausência de dados
- invalide as queries relacionadas depois de mutações
- não faça chamadas HTTP durante a renderização
- mantenha a configuração global em `src/integrations/tanstack-query`

Os imports dos hooks devem seguir o diretório gerado pelo Kubb em `#/http`. Se a configuração de saída mudar, use o novo caminho e atualize este documento.

## Formulários

Os formulários do dashboard usam as seguintes ferramentas:

- `react-hook-form` para estado, submissão e erros
- Zod para declarar o schema e inferir o tipo dos valores
- `@hookform/resolvers/zod` para conectar Zod ao formulário
- componentes de formulário do shadcn/ui
- hooks de mutation gerados pelo Kubb
- TanStack Query para atualizar ou invalidar o cache
- Sonner para feedback de erro e sucesso
- `getApiErrorMessage` para extrair mensagens de erro da API

Declare o schema fora do componente e derive o tipo com `z.infer`. Defina todos os `defaultValues`, use `form.handleSubmit` e desabilite a ação principal durante `isPending`. Configure também `label`, `autoComplete` e `aria-invalid`.

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
                const queryKey = getMeQueryOptions().queryKey;
                queryClient.setQueryData(queryKey, user);
                navigate({ to: '/' });
            },
            onError: (error) => {
                const message = getApiErrorMessage(
                    error,
                    'Não foi possível entrar',
                );
                toast.error(message);
            },
        },
    });

    const onSubmit = (values: LoginInput) => {
        mutate({ body: values });
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
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
                                    aria-invalid={Boolean(
                                        form.formState.errors.email,
                                    )}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Entrando…' : 'Entrar'}
                </Button>
            </form>
        </Form>
    );
};
```

Siga estas regras em todos os formulários:

1. Use um `FormField` por campo controlado
2. Mostre o erro com `FormMessage`, sem duplicar a mensagem manualmente
3. Escreva mensagens de validação em português e orientadas à correção
4. Use o hook gerado pelo Kubb em vez de criar mutations HTTP manualmente
5. Atualize o cache diretamente quando a resposta contiver o dado completo
6. Invalide a query relacionada quando a resposta não contiver o dado completo
7. Em `onError`, prefira a mensagem da API e mantenha um fallback compreensível
8. Não acrescente ao cache propriedades que não existam no contrato da API
9. Extraia formulários reutilizáveis e mantenha a rota focada na composição

## Interface e componentes shadcn/ui

Use os componentes do shadcn/ui instalados no projeto antes de criar qualquer componente visual novo. Eles ficam em `#/components/ui` e definem a base de aparência, comportamento e acessibilidade do dashboard.

Siga esta ordem ao implementar uma interface:

1. Use um componente shadcn/ui já disponível em `#/components/ui`
2. Componha os componentes shadcn/ui existentes para atender à tela
3. Adicione ao projeto um componente oficial do shadcn/ui quando ele existir
4. Crie um componente visual próprio somente em último caso

Não recrie manualmente controles que o shadcn/ui já oferece, como botões, campos, labels, cards, badges, diálogos ou menus. Preserve a API e os estilos dos componentes instalados ao estendê-los.

Além disso:

- use tokens semânticos definidos em `styles.css`
- mantenha os textos em português e use verbos diretos nas ações
- garanta foco visível, labels acessíveis e navegação por teclado
- projete a interface para telas pequenas desde o início
- evite componentes grandes dentro do arquivo da rota

## Organização dos componentes da página

Componentes específicos de uma página ficam co-localizados na pasta da rota. Coloque-os em uma subpasta prefixada com `-`, que o TanStack Router ignora ao gerar as rotas.

```text
routes/
└── clients/
    ├── index.tsx
    ├── $clientId.tsx
    └── -components/
        ├── client-list.tsx
        ├── client-form.tsx
        └── client-status-badge.tsx
```

Use também `-hooks/` e `-queries/` para isolar lógica exclusiva da página. Mova para `src/components/` apenas o que for reutilizável fora daquela rota.

## Quando criar um componente próprio

Crie um componente próprio somente quando os componentes shadcn/ui instalados ou disponíveis não atenderem ao caso. Mesmo assim, o novo componente deve cumprir pelo menos um destes critérios:

- **Responsabilidade definida**: representa uma parte identificável da interface, como `DocumentHeader` ou `ClientCard`
- **Reutilização**: aparece em mais de um local e precisa manter aparência e comportamento consistentes
- **Complexidade independente**: possui estado, eventos, regras ou cálculos próprios, como um `A4Document`

Use esta regra prática:

```text
responsabilidade própria
OU reutilização
OU complexidade independente
= provável componente
```

Ao criar um componente próprio, componha os primitives do shadcn/ui sempre que possível. Não extraia componentes que apenas envolvam poucas tags sem lógica, significado próprio ou potencial de reutilização.
