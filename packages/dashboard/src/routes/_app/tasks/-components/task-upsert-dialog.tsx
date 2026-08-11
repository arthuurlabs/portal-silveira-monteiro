import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type {
	ListTasksStatus200,
	ListTasksStatus200DataStatusEnumKey,
} from "#/http/types/ListTasks";

import { TaskForm } from "./task-form";

type TaskListItem = ListTasksStatus200["data"][number];

type TaskUpsertDialogProps = {
	task?: TaskListItem;
	defaultStatus?: ListTasksStatus200DataStatusEnumKey;
	children: React.ReactNode;
};

export const TaskUpsertDialog = ({
	task,
	defaultStatus,
	children,
}: TaskUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
				</DialogHeader>
				<TaskForm
					task={task}
					defaultStatus={defaultStatus}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
