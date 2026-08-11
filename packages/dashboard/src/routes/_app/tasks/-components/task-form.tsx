import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { Textarea } from "#/components/ui/textarea";
import { useCreateTask } from "#/http/hooks/useCreateTask";
import { useUpdateTask } from "#/http/hooks/useUpdateTask";
import type {
	ListTasksStatus200,
	ListTasksStatus200DataStatusEnumKey,
} from "#/http/types/ListTasks";
import { getApiErrorMessage } from "#/lib/api-error";

type TaskListItem = ListTasksStatus200["data"][number];

const taskFormSchema = z.object({
	title: z.string().trim().min(1, "Informe o título"),
	description: z.string().trim(),
	dueDate: z.string().trim(),
});

type TaskFormInput = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
	task?: TaskListItem;
	defaultStatus?: ListTasksStatus200DataStatusEnumKey;
	onSuccess: () => void;
};

export const TaskForm = ({ task, defaultStatus, onSuccess }: TaskFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<TaskFormInput>({
		resolver: zodResolver(taskFormSchema),
		defaultValues: {
			title: task?.title ?? "",
			description: task?.description ?? "",
			dueDate: task?.dueDate ?? "",
		},
	});

	const invalidateTasks = () => {
		queryClient.invalidateQueries({ queryKey: [{ url: "/tasks" }] });
	};

	const handleError = (error: unknown) => {
		toast.error(getApiErrorMessage(error, "Não foi possível salvar a tarefa"));
	};

	const { mutate: createTask, isPending: isCreating } = useCreateTask({
		mutation: {
			onSuccess: () => {
				invalidateTasks();
				toast.success("Tarefa criada com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateTask, isPending: isUpdating } = useUpdateTask({
		mutation: {
			onSuccess: () => {
				invalidateTasks();
				toast.success("Tarefa atualizada com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const isPending = isCreating || isUpdating;

	const onSubmit = (values: TaskFormInput) => {
		const body = {
			title: values.title,
			description: values.description || undefined,
			dueDate: values.dueDate || undefined,
		};

		if (task) {
			updateTask({ path: { id: task.id }, body });
			return;
		}

		createTask({ body: { ...body, status: defaultStatus } });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Título</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição</FormLabel>
							<FormControl>
								<Textarea rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="dueDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Prazo</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Salvando..." : "Salvar"}
				</Button>
			</form>
		</Form>
	);
};
