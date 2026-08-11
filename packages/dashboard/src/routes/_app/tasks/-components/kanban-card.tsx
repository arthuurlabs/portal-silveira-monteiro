import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card } from "#/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useDeleteTask } from "#/http/hooks/useDeleteTask";
import type { ListTasksStatus200 } from "#/http/types/ListTasks";
import { getApiErrorMessage } from "#/lib/api-error";
import { formatDate } from "#/lib/format-date";

import { TaskUpsertDialog } from "./task-upsert-dialog";

type TaskListItem = ListTasksStatus200["data"][number];

type KanbanCardProps = {
	task: TaskListItem;
};

export const KanbanCard = ({ task }: KanbanCardProps) => {
	const queryClient = useQueryClient();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id });

	const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [{ url: "/tasks" }] });
				toast.success("Tarefa excluída com sucesso");
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir a tarefa"),
				);
			},
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<AlertDialog>
			<Card
				ref={setNodeRef}
				style={style}
				className="group flex flex-col gap-2 p-3 shadow-none"
			>
				<div className="flex items-start justify-between gap-2">
					<button
						type="button"
						{...attributes}
						{...listeners}
						className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground focus-visible:text-foreground active:cursor-grabbing"
						aria-label={`Arrastar tarefa: ${task.title}`}
					>
						<GripVertical className="size-4" />
					</button>

					<TaskUpsertDialog task={task}>
						<button
							type="button"
							className="flex-1 text-left text-sm font-medium text-foreground hover:underline"
						>
							{task.title}
						</button>
					</TaskUpsertDialog>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="size-6 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
								aria-label="Ações da tarefa"
							>
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<TaskUpsertDialog task={task}>
								<DropdownMenuItem onSelect={(event) => event.preventDefault()}>
									<Pencil />
									Editar
								</DropdownMenuItem>
							</TaskUpsertDialog>
							<AlertDialogTrigger asChild>
								<DropdownMenuItem
									variant="destructive"
									onSelect={(event) => event.preventDefault()}
								>
									<Trash2 />
									Excluir
								</DropdownMenuItem>
							</AlertDialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{task.description ? (
					<p className="line-clamp-2 text-sm text-muted-foreground">
						{task.description}
					</p>
				) : null}

				{task.dueDate ? (
					<Badge variant="neutral" className="w-fit">
						{formatDate(task.dueDate)}
					</Badge>
				) : null}
			</Card>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação não pode ser desfeita. A tarefa será removida
						permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isDeleting}
						onClick={() => deleteTask({ path: { id: task.id } })}
					>
						{isDeleting ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
