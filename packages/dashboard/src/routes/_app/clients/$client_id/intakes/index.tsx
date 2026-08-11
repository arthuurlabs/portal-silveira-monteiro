import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useListIntakes } from "#/http/hooks/useListIntakes";

import { IntakeList } from "./-components/intake-list";
import { IntakeUpsertDialog } from "./-components/intake-upsert-dialog";

const ClientIntakesRoute = () => {
	const { client } = Route.useRouteContext();

	const { data, isPending, isError } = useListIntakes({
		path: { clientId: client.id },
		query: { page: 1, pageSize: 50 },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Atendimentos</p>
					<h1 className="sm-display text-3xl md:text-4xl">Atendimentos</h1>
					<div className="sm-rule" />
				</div>

				<IntakeUpsertDialog clientId={client.id}>
					<Button>
						<Plus />
						Novo atendimento
					</Button>
				</IntakeUpsertDialog>
			</div>

			<IntakeList
				clientId={client.id}
				intakes={data?.data}
				isPending={isPending}
				isError={isError}
			/>
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/intakes/")({
	component: ClientIntakesRoute,
	head: () => ({ meta: [{ title: "Atendimentos | Silveira & Monteiro" }] }),
});
