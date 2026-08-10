import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/')({
    component: AppRoute,
});

function AppRoute() {
    return <div>Hello "/_app/"!</div>;
}
