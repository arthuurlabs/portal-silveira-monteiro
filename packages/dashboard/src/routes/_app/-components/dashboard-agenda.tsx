import { Link } from "@tanstack/react-router";
import { AlertCircle, CalendarDays, Megaphone } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Alert, AlertDescription } from "#/components/ui/alert";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useListEvents } from "#/http/hooks/useListEvents";

import {
	getRelativeDayLabel,
	getUpcomingWeekRange,
} from "./dashboard-date-range";

const SKELETON_ROWS = ["a", "b", "c"];

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
	hour: "2-digit",
	minute: "2-digit",
});

export const DashboardAgenda = () => {
	const { from, to } = getUpcomingWeekRange();
	const { data, isPending, isError } = useListEvents({ query: { from, to } });
	const events = data?.data.slice(0, 5) ?? [];

	return (
		<Card className="flex flex-col">
			<CardHeader>
				<CardTitle>Compromissos da semana</CardTitle>
			</CardHeader>

			<CardContent className="flex-1">
				{isError ? (
					<Alert variant="danger">
						<AlertCircle />
						<AlertDescription>
							Não foi possível carregar os compromissos. Tente novamente.
						</AlertDescription>
					</Alert>
				) : isPending ? (
					<div className="flex flex-col gap-3">
						{SKELETON_ROWS.map((row) => (
							<Skeleton key={row} className="h-10 w-full" />
						))}
					</div>
				) : events.length === 0 ? (
					<EmptyState
						icon={CalendarDays}
						title="Nenhum compromisso nos próximos 7 dias"
					/>
				) : (
					<ul className="flex flex-col gap-3">
						{events.map((event) => (
							<li key={event.id} className="flex items-center gap-3">
								<div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-md border border-border px-2 py-1 text-center">
									<span className="text-[0.625rem] font-bold uppercase tracking-wide text-muted-foreground">
										{getRelativeDayLabel(new Date(event.startAt))}
									</span>
									<span className="font-mono text-xs text-foreground">
										{timeFormatter.format(new Date(event.startAt))}
									</span>
								</div>

								<span className="flex-1 truncate text-sm text-foreground">
									{event.title}
								</span>

								{event.isGlobal ? (
									<span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.625rem] font-bold text-accent-foreground">
										<Megaphone className="size-3" aria-hidden="true" />
										Firma
									</span>
								) : null}
							</li>
						))}
					</ul>
				)}
			</CardContent>

			<CardFooter>
				<Link
					to="/calendar"
					className="text-sm font-bold text-primary hover:underline"
				>
					Ver calendário
				</Link>
			</CardFooter>
		</Card>
	);
};
