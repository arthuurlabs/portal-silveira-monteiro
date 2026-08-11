import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useMoveTask } from "#/http/hooks/useMoveTask";
import type {
	ListTasksStatus200,
	ListTasksStatus200DataStatusEnumKey,
} from "#/http/types/ListTasks";
import { getApiErrorMessage } from "#/lib/api-error";

import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import { TASK_COLUMNS } from "./task-columns";

type TaskListItem = ListTasksStatus200["data"][number];
type Status = ListTasksStatus200DataStatusEnumKey;
type ColumnsState = Record<Status, TaskListItem[]>;

const groupByStatus = (tasks: TaskListItem[]): ColumnsState => {
	const grouped: ColumnsState = { TODO: [], IN_PROGRESS: [], DONE: [] };

	for (const task of tasks) {
		grouped[task.status].push(task);
	}

	return grouped;
};

type KanbanBoardProps = {
	tasks: TaskListItem[];
};

export const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
	const queryClient = useQueryClient();
	const [columns, setColumns] = useState<ColumnsState>(() =>
		groupByStatus(tasks),
	);
	const [activeTask, setActiveTask] = useState<TaskListItem | null>(null);

	useEffect(() => {
		setColumns(groupByStatus(tasks));
	}, [tasks]);

	const { mutate: moveTask } = useMoveTask({
		mutation: {
			onError: (error) => {
				queryClient.invalidateQueries({ queryKey: [{ url: "/tasks" }] });
				toast.error(
					getApiErrorMessage(error, "Não foi possível mover a tarefa"),
				);
			},
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const findColumnOf = (taskId: string): Status | null => {
		for (const column of TASK_COLUMNS) {
			if (columns[column.status].some((task) => task.id === taskId)) {
				return column.status;
			}
		}
		return null;
	};

	const resolveOverColumn = (overId: string): Status | null => {
		if (TASK_COLUMNS.some((column) => column.status === overId)) {
			return overId as Status;
		}
		return findColumnOf(overId);
	};

	const handleDragStart = (event: DragStartEvent) => {
		const taskId = String(event.active.id);
		const column = findColumnOf(taskId);
		if (!column) return;
		setActiveTask(columns[column].find((task) => task.id === taskId) ?? null);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = String(active.id);
		const overColumn = resolveOverColumn(String(over.id));
		const activeColumn = findColumnOf(activeId);

		if (!overColumn || !activeColumn || activeColumn === overColumn) return;

		setColumns((current) => {
			const activeTasks = current[activeColumn];
			const movingTask = activeTasks.find((task) => task.id === activeId);
			if (!movingTask) return current;

			const overTasks = current[overColumn];
			const overIndex = overTasks.findIndex(
				(task) => task.id === String(over.id),
			);

			return {
				...current,
				[activeColumn]: activeTasks.filter((task) => task.id !== activeId),
				[overColumn]:
					overIndex >= 0
						? [
								...overTasks.slice(0, overIndex),
								{ ...movingTask, status: overColumn },
								...overTasks.slice(overIndex),
							]
						: [...overTasks, { ...movingTask, status: overColumn }],
			};
		});
	};

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveTask(null);

		const { active, over } = event;
		if (!over) return;

		const activeId = String(active.id);
		const overColumn = resolveOverColumn(String(over.id));
		const activeColumn = findColumnOf(activeId);
		if (!overColumn || !activeColumn) return;

		const columnTasks = columns[activeColumn];
		const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
		const overId = String(over.id);
		const newIndex =
			overId === overColumn
				? columnTasks.length - 1
				: columnTasks.findIndex((task) => task.id === overId);

		if (oldIndex === -1 || newIndex === -1) return;

		const reordered =
			oldIndex === newIndex
				? columnTasks
				: arrayMove(columnTasks, oldIndex, newIndex);

		setColumns((current) => ({ ...current, [activeColumn]: reordered }));

		moveTask({
			path: { id: activeId },
			body: {
				status: overColumn,
				orderedIds: reordered.map((task) => task.id),
			},
		});
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{TASK_COLUMNS.map((column) => (
					<KanbanColumn
						key={column.status}
						status={column.status}
						label={column.label}
						tasks={columns[column.status]}
					/>
				))}
			</div>
			<DragOverlay>
				{activeTask ? <KanbanCard task={activeTask} /> : null}
			</DragOverlay>
		</DndContext>
	);
};
