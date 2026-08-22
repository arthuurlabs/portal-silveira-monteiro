import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet, redirect, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '#/components/ui/alert-dialog';
import { Button } from '#/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { ResponseError } from '#/http/.kubb/client';
import { getClientQueryOptions } from '#/http/hooks/useGetClient';
import { listClientsQueryKey } from '#/http/hooks/useListClients';
import { useUpdateClient } from '#/http/hooks/useUpdateClient';
import type { GetClientStatus200 } from '#/http/types/GetClient';
import { getApiErrorMessage } from '#/lib/api-error';
import { formatCnpj, formatCpf } from '#/lib/masks';

import { ClientUpsertDialog } from '../-components/client-upsert-dialog';

const buildUpdateBody = (client: GetClientStatus200, isActive: boolean) => {
    if (client.personType === 'JURIDICA') {
        return {
            personType: client.personType,
            cnpj: client.cnpj ?? '',
            razaoSocial: client.razaoSocial ?? '',
            nomeFantasia: client.nomeFantasia ?? undefined,
            phone: client.phone ?? undefined,
            email: client.email ?? undefined,
            address: client.address ?? undefined,
            isActive,
        } as const;
    }

    return {
        personType: client.personType,
        fullName: client.fullName,
        cpf: client.cpf ?? '',
        rg: client.rg ?? undefined,
        birthDate: client.birthDate ?? undefined,
        maritalStatus: client.maritalStatus ?? undefined,
        profession: client.profession ?? undefined,
        phone: client.phone ?? undefined,
        email: client.email ?? undefined,
        address: client.address ?? undefined,
        isActive,
    } as const;
};

const CLIENT_TABS = [
    { value: 'overview', label: 'Visão geral', to: '/clients/$client_id' },
    {
        value: 'intakes',
        label: 'Atendimentos',
        to: '/clients/$client_id/intakes',
    },
    { value: 'files', label: 'Arquivos', to: '/clients/$client_id/files' },
    { value: 'templates', label: 'Modelos', to: '/clients/$client_id/templates' },
] as const;

const ClientLayout = () => {
    const { client_id } = Route.useParams();
    const matchRoute = useMatchRoute();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { client } = Route.useLoaderData();

    const invalidateClients = () => {
        queryClient.invalidateQueries({
            queryKey: getClientQueryOptions({ path: { id: client_id } }).queryKey,
        });
        queryClient.invalidateQueries({ queryKey: listClientsQueryKey({}) });
    };

    const { mutate: updateClient, isPending: isUpdating } = useUpdateClient({
        mutation: {
            onError: (error) => {
                toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o cliente'));
            },
        },
    });

    const activeTab =
        CLIENT_TABS.find((tab) =>
            matchRoute({
                to: tab.to,
                params: { client_id },
                fuzzy: false,
            })
        )?.value ?? 'overview';

    const handleExclude = () => {
        updateClient(
            { path: { id: client.id }, body: buildUpdateBody(client, false) },
            {
                onSuccess: () => {
                    invalidateClients();
                    toast.success('Cliente excluído com sucesso');
                    navigate({ to: '/clients' });
                },
            }
        );
    };

    const handleReactivate = () => {
        updateClient(
            { path: { id: client.id }, body: buildUpdateBody(client, true) },
            {
                onSuccess: () => {
                    invalidateClients();
                    toast.success('Cliente reativado com sucesso');
                },
            }
        );
    };

    const isJuridica = client.personType === 'JURIDICA';
    const displayName = isJuridica ? (client.razaoSocial ?? client.fullName) : client.fullName;
    const displayDocument = isJuridica ? formatCnpj(client.cnpj) : formatCpf(client.cpf);

    return (
        <div className="flex flex-col gap-6">
            <Link
                to="/clients"
                className="w-fit text-sm text-muted-foreground hover:text-foreground print:hidden"
            >
                ← Voltar para clientes
            </Link>

            <div className="flex items-center justify-between gap-4 print:hidden">
                <div className="flex flex-col gap-2">
                    <p className="sm-eyebrow">{isJuridica ? 'Pessoa jurídica' : 'Pessoa física'}</p>
                    <h1 className="sm-display text-3xl md:text-4xl">{displayName}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{displayDocument}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ClientUpsertDialog client={client}>
                        <Button variant="outline">
                            <Pencil />
                            Editar
                        </Button>
                    </ClientUpsertDialog>

                    {client.isActive ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Trash2 />
                                    Excluir
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        O cliente será marcado como inativo e deixará de aparecer na
                                        listagem por padrão. Nenhum dado é apagado, e você pode
                                        reativá-lo quando quiser.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        disabled={isUpdating}
                                        onClick={handleExclude}
                                    >
                                        {isUpdating ? 'Excluindo...' : 'Excluir'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button variant="outline" disabled={isUpdating} onClick={handleReactivate}>
                            <RotateCcw />
                            {isUpdating ? 'Reativando...' : 'Reativar'}
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} className="print:hidden">
                <TabsList>
                    {CLIENT_TABS.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} asChild>
                            <Link to={tab.to} params={{ client_id }}>
                                {tab.label}
                            </Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Outlet />
        </div>
    );
};

export const Route = createFileRoute('/_app/clients/$client_id')({
    loader: async ({ context, params }) => {
        try {
            const client = await context.queryClient.ensureQueryData({
                ...getClientQueryOptions({ path: { id: params.client_id } }),
                retry: false,
            });
            return { client };
        } catch (error) {
            if (error instanceof ResponseError && error.status === 404) {
                throw redirect({ to: '/clients' });
            }
            throw error;
        }
    },
    component: ClientLayout,
});
