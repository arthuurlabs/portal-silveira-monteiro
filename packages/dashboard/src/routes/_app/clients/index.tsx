import { createFileRoute } from "@tanstack/react-router";

import { useListClients } from "#/http/hooks/useListClients";

import { ClientList } from "./-components/client-list";

const ClientsRoute = () => {
	const { data, isPending, isError } = useListClients({
		query: { page: 1, pageSize: 50 },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<p className="sm-eyebrow">Clientes</p>
				<h1 className="sm-display text-3xl md:text-4xl">Clientes</h1>
				<div className="sm-rule" />
			</div>

			<ClientList
				clients={data?.data}
				isPending={isPending}
				isError={isError}
			/>
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/")({
	component: ClientsRoute,
	head: () => ({ meta: [{ title: "Clientes | Silveira & Monteiro" }] }),
});
