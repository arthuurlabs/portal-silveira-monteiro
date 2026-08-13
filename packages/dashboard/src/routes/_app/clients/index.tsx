import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useListClients } from "#/http/hooks/useListClients";

import { ClientList } from "./-components/client-list";
import { ClientUpsertDialog } from "./-components/client-upsert-dialog";

const ClientsRoute = () => {
	const { data, isPending, isError } = useListClients({
		query: { page: 1, pageSize: 50, isActive: "true" },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Clientes</p>
					<h1 className="sm-display text-3xl md:text-4xl">Clientes</h1>
					<div className="sm-rule" />
				</div>

				<ClientUpsertDialog>
					<Button>
						<Plus />
						Novo cliente
					</Button>
				</ClientUpsertDialog>
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
