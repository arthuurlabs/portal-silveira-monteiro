import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useListProcesses } from "#/http/hooks/useListProcesses";

import { ProcessList } from "./-components/process-list";
import { ProcessUpsertDialog } from "./-components/process-upsert-dialog";

const ProcessesRoute = () => {
	const { data, isPending, isError } = useListProcesses({
		query: { page: 1, pageSize: 50 },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Processos</p>
					<h1 className="sm-display text-3xl md:text-4xl">Processos</h1>
					<div className="sm-rule" />
				</div>

				<ProcessUpsertDialog>
					<Button>
						<Plus />
						Novo processo
					</Button>
				</ProcessUpsertDialog>
			</div>

			<ProcessList
				processes={data?.data}
				isPending={isPending}
				isError={isError}
			/>
		</div>
	);
};

export const Route = createFileRoute("/_app/processes/")({
	component: ProcessesRoute,
	head: () => ({ meta: [{ title: "Processos | Silveira & Monteiro" }] }),
});
