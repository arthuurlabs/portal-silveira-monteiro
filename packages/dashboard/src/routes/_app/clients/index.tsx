import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { useListClients } from "#/http/hooks/useListClients";

import { ClientList } from "./-components/client-list";
import { ClientUpsertDialog } from "./-components/client-upsert-dialog";

const STATUS_FILTERS = [
	{ value: "active", label: "Ativos", isActive: "true" as const },
	{ value: "all", label: "Todos", isActive: undefined },
	{ value: "inactive", label: "Inativos", isActive: "false" as const },
];

const ClientsRoute = () => {
	const [status, setStatus] = useState("active");
	const isActive = STATUS_FILTERS.find(
		(option) => option.value === status,
	)?.isActive;

	const { data, isPending, isError } = useListClients({
		query: { page: 1, pageSize: 50, isActive },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Clientes</p>
					<h1 className="sm-display text-3xl md:text-4xl">Clientes</h1>
					<div className="sm-rule" />
				</div>

				<div className="flex items-center gap-2">
					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger className="w-36">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUS_FILTERS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<ClientUpsertDialog>
						<Button>
							<Plus />
							Novo cliente
						</Button>
					</ClientUpsertDialog>
				</div>
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
