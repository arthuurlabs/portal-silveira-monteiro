import {
	createFileRoute,
	Link,
	notFound,
	Outlet,
	useMatchRoute,
} from "@tanstack/react-router";
import { Pencil } from "lucide-react";

import { Button, buttonVariants } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { ResponseError } from "#/http/.kubb/client";
import { getClientQueryOptions } from "#/http/hooks/useGetClient";

import { ClientStatusBadge } from "../-components/client-status-badge";
import { ClientUpsertDialog } from "../-components/client-upsert-dialog";

const CLIENT_TABS = [
	{ value: "overview", label: "Visão geral", to: "/clients/$client_id" },
	{
		value: "intakes",
		label: "Atendimentos",
		to: "/clients/$client_id/intakes",
	},
	{ value: "files", label: "Arquivos", to: "/clients/$client_id/files" },
	{ value: "templates", label: "Modelos", to: "/clients/$client_id/templates" },
] as const;

const ClientLayout = () => {
	const { client } = Route.useRouteContext();
	const matchRoute = useMatchRoute();
	const activeTab =
		CLIENT_TABS.find((tab) =>
			matchRoute({
				to: tab.to,
				params: { client_id: client.id },
				fuzzy: false,
			}),
		)?.value ?? "overview";

	return (
		<div className="flex flex-col gap-6">
			<Link
				to="/clients"
				className="w-fit text-sm text-muted-foreground hover:text-foreground"
			>
				← Voltar para clientes
			</Link>

			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-2">
					<p className="sm-eyebrow">Cliente</p>
					<h1 className="sm-display text-3xl md:text-4xl">{client.fullName}</h1>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>{client.cpf}</span>
						<ClientStatusBadge isActive={client.isActive} />
					</div>
				</div>

				<ClientUpsertDialog client={client}>
					<Button variant="outline">
						<Pencil />
						Editar
					</Button>
				</ClientUpsertDialog>
			</div>

			<Tabs value={activeTab}>
				<TabsList>
					{CLIENT_TABS.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value} asChild>
							<Link to={tab.to} params={{ client_id: client.id }}>
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

const ClientNotFound = () => {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<p className="text-lg font-medium text-foreground">
				Cliente não encontrado
			</p>
			<p className="text-sm text-muted-foreground">
				O cliente que você está procurando não existe ou foi removido.
			</p>
			<Link
				to="/clients"
				className={buttonVariants({ variant: "outline", className: "mt-2" })}
			>
				Voltar para clientes
			</Link>
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id")({
	beforeLoad: async ({ context, params }) => {
		try {
			const client = await context.queryClient.ensureQueryData({
				...getClientQueryOptions({ path: { id: params.client_id } }),
				retry: false,
			});
			return { client };
		} catch (error) {
			if (error instanceof ResponseError && error.status === 404) {
				throw notFound();
			}
			throw error;
		}
	},
	component: ClientLayout,
	notFoundComponent: ClientNotFound,
});
