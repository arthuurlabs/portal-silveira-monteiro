import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import type {
	ListTasksStatus200,
	ListTasksStatus200DataStatusEnumKey,
} from "#/http/types/ListTasks";

import { KanbanCard } from "./kanban-card";
import { TaskUpsertDialog } from "./task-upsert-dialog";

type TaskListItem = ListTasksStatus200["data"][number];

type KanbanColumnProps = {
	status: ListTasksStatus200DataStatusEnumKey;
	label: string;
	tasks: TaskListItem[];
};

export const KanbanColumn = ({ status, label, tasks }: KanbanColumnProps) => {
	const { setNodeRef } = useDroppable({ id: status });

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
			<div className="flex items-center justify-between gap-2 px-1">
				<h2 className="text-sm font-semibold text-foreground">{label}</h2>
				<span className="text-xs text-muted-foreground">{tasks.length}</span>
			</div>

			<SortableContext
				items={tasks.map((task) => task.id)}
				strategy={verticalListSortingStrategy}
			>
				<div ref={setNodeRef} className="flex min-h-16 flex-col gap-2">
					{tasks.length === 0 ? (
						<p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
							Nenhuma tarefa aqui
						</p>
					) : (
						tasks.map((task) => <KanbanCard key={task.id} task={task} />)
					)}
				</div>
			</SortableContext>

			<TaskUpsertDialog defaultStatus={status}>
				<Button
					variant="ghost"
					size="sm"
					className="justify-start text-muted-foreground"
				>
					<Plus />
					Adicionar tarefa
				</Button>
			</TaskUpsertDialog>
		</div>
	);
};
