import { Link } from "@tanstack/react-router";
import { AlertCircle, ListChecks } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useListTasks } from "#/http/hooks/useListTasks";
import { formatDate } from "#/lib/format-date";

import { getTodayDateString } from "./dashboard-date-range";

const SKELETON_ROWS = ["a", "b", "c"];

export const DashboardTasks = () => {
	const { data, isPending, isError } = useListTasks();

	const pendingTasks = (data?.data ?? [])
		.filter((task) => task.status !== "DONE")
		.sort((a, b) => {
			if (!a.dueDate) return 1;
			if (!b.dueDate) return -1;
			return a.dueDate.localeCompare(b.dueDate);
		})
		.slice(0, 5);

	const todayDateString = getTodayDateString();

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle>Tarefas pendentes</CardTitle>
			</CardHeader>

			<CardContent className="flex-1">
				{isError ? (
					<Alert variant="danger">
						<AlertCircle />
						<AlertDescription>
							Não foi possível carregar as tarefas. Tente novamente.
						</AlertDescription>
					</Alert>
				) : isPending ? (
					<div className="flex flex-col gap-3">
						{SKELETON_ROWS.map((row) => (
							<Skeleton key={row} className="h-10 w-full" />
						))}
					</div>
				) : pendingTasks.length === 0 ? (
					<EmptyState icon={ListChecks} title="Nenhuma tarefa pendente" />
				) : (
					<ul className="flex flex-col gap-3">
						{pendingTasks.map((task) => {
							const isOverdue = Boolean(
								task.dueDate && task.dueDate < todayDateString,
							);
							const isDueToday = task.dueDate === todayDateString;

							return (
								<li
									key={task.id}
									className="flex items-center justify-between gap-3"
								>
									<span className="flex-1 truncate text-sm text-foreground">
										{task.title}
									</span>
									{task.dueDate ? (
										<Badge
											variant={
												isOverdue
													? "destructive"
													: isDueToday
														? "warning"
														: "neutral"
											}
										>
											{formatDate(task.dueDate)}
										</Badge>
									) : (
										<Badge variant="neutral">Sem prazo</Badge>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>

			<CardFooter>
				<Link
					to="/tasks"
					className="text-sm font-bold text-primary hover:underline"
				>
					Ver quadro de tarefas
				</Link>
			</CardFooter>
		</Card>
	);
};
