import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/sign-in/')({
    component: SignInRoute,
    head: () => ({
        meta: [
            {
                title: 'Acesse sua conta | Portal Silveira Monteiro',
            },
        ],
    }),
});

function SignInRoute() {
    return <div>Hello "/_auth/sign-in/"!</div>;
}
