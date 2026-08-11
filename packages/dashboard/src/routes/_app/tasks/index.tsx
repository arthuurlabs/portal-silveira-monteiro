import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/tasks/')({
    component: TasksRoute,
});

function TasksRoute() {
    return <div>Hello "/_app/tasks/"!</div>;
}
