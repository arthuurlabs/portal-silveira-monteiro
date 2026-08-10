import { useGetMe } from '#/http/hooks/useGetMe';
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
    component: AppLayout,
});

function AppLayout() {
    const { data, isFetching, isLoading } = useGetMe();

    if (isLoading || isFetching) {
        return <div>Carregando...</div>;
    }

    if (!data) return <Navigate to="/sign-in" replace/>;

    return <Outlet />;
}
