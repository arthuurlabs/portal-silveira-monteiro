import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, ListChecks, Users } from "lucide-react";

import { Card } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useListClients } from "#/http/hooks/useListClients";
import { useListEvents } from "#/http/hooks/useListEvents";
import { useListTasks } from "#/http/hooks/useListTasks";
import { listClientsIsActive } from "#/http/types/ListClients";
import { cn } from "#/lib/utils";

import {
	getTodayDateString,
	getUpcomingWeekRange,
	startOfDay,
} from "./dashboard-date-range";

type StatTileProps = {
	icon: LucideIcon;
	label: string;
	value: number | null;
	isPending: boolean;
	isError: boolean;
	tone?: "default" | "warning";
};

const StatTile = ({
	icon: Icon,
	label,
	value,
	isPending,
	isError,
	tone = "default",
}: StatTileProps) => {
	return (
		<Card className="flex flex-col gap-3 p-5">
			<span
				className={cn(
					"flex size-9 items-center justify-center rounded-md",
					tone === "warning" && value
						? "bg-warning/10 text-warning"
						: "bg-primary/8 text-primary",
				)}
			>
				<Icon className="size-4" aria-hidden="true" />
			</span>

			{isPending ? (
				<Skeleton className="h-8 w-14" />
			) : isError ? (
				<p className="font-display text-3xl font-medium text-muted-foreground">
					—
				</p>
			) : (
				<p className="font-display text-3xl font-medium text-foreground">
					{value}
				</p>
			)}

			<p className="text-sm text-muted-foreground">{label}</p>
		</Card>
	);
};

export const DashboardStats = () => {
	const { from, to } = getUpcomingWeekRange();
	const eventsQuery = useListEvents({ query: { from, to } });
	const tasksQuery = useListTasks();
	const clientsQuery = useListClients({
		query: { isActive: listClientsIsActive.true, pageSize: 1 },
	});

	const today = startOfDay(new Date());
	const todayEventsCount =
		eventsQuery.data?.data.filter(
			(event) =>
				startOfDay(new Date(event.startAt)).getTime() === today.getTime(),
		).length ?? null;

	const openTasks =
		tasksQuery.data?.data.filter((task) => task.status !== "DONE") ?? null;
	const todayDateString = getTodayDateString();
	const overdueTasksCount =
		openTasks?.filter(
			(task) => task.dueDate !== null && task.dueDate < todayDateString,
		).length ?? null;

	const activeClientsCount = clientsQuery.data?.pagination.total ?? null;

	return (
		<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatTile
				icon={CalendarDays}
				label="Compromissos hoje"
				value={todayEventsCount}
				isPending={eventsQuery.isPending}
				isError={eventsQuery.isError}
			/>
			<StatTile
				icon={ListChecks}
				label="Tarefas pendentes"
				value={openTasks?.length ?? null}
				isPending={tasksQuery.isPending}
				isError={tasksQuery.isError}
			/>
			<StatTile
				icon={Clock}
				label="Tarefas atrasadas"
				value={overdueTasksCount}
				isPending={tasksQuery.isPending}
				isError={tasksQuery.isError}
				tone="warning"
			/>
			<StatTile
				icon={Users}
				label="Clientes ativos"
				value={activeClientsCount}
				isPending={clientsQuery.isPending}
				isError={clientsQuery.isError}
			/>
		</div>
	);
};
