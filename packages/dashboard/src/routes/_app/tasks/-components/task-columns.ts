import type { ListTasksStatus200DataStatusEnumKey } from "#/http/types/ListTasks";

export const TASK_COLUMNS: {
	status: ListTasksStatus200DataStatusEnumKey;
	label: string;
}[] = [
	{ status: "TODO", label: "A Fazer" },
	{ status: "IN_PROGRESS", label: "Em Andamento" },
	{ status: "DONE", label: "Concluído" },
];
