import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "#/components/ui/alert";
import { Skeleton } from "#/components/ui/skeleton";
import { useListTasks } from "#/http/hooks/useListTasks";

import { KanbanBoard } from "./-components/kanban-board";

const SKELETON_COLUMNS = ["column-1", "column-2", "column-3"];

const TasksRoute = () => {
	const { data, isPending, isError } = useListTasks();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<p className="sm-eyebrow">Tarefas</p>
				<h1 className="sm-display text-3xl md:text-4xl">Quadro de tarefas</h1>
				<div className="sm-rule" />
			</div>

			{isError ? (
				<Alert variant="danger">
					<AlertCircle />
					<AlertDescription>
						Não foi possível carregar as tarefas. Tente novamente.
					</AlertDescription>
				</Alert>
			) : isPending ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{SKELETON_COLUMNS.map((column) => (
						<Skeleton key={column} className="h-64 w-full" />
					))}
				</div>
			) : (
				<KanbanBoard tasks={data.data} />
			)}
		</div>
	);
};

export const Route = createFileRoute("/_app/tasks/")({
	component: TasksRoute,
	head: () => ({ meta: [{ title: "Tarefas | Silveira & Monteiro" }] }),
});
