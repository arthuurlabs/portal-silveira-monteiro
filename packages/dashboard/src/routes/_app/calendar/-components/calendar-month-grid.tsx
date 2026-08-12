import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "#/components/ui/button";
import type { ListEventsStatus200 } from "#/http/types/ListEvents";

import { CalendarDayCell } from "./calendar-day-cell";

type EventListItem = ListEventsStatus200["data"][number];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const getMonthGridRange = (month: Date) => {
	const start = startOfWeek(startOfMonth(month));
	const end = endOfWeek(endOfMonth(month));
	return { start, end };
};

type CalendarMonthGridProps = {
	month: Date;
	onMonthChange: (month: Date) => void;
	events: ListEventsStatus200["data"];
	currentUserId: string | undefined;
};

export const CalendarMonthGrid = ({
	month,
	onMonthChange,
	events,
	currentUserId,
}: CalendarMonthGridProps) => {
	const { start, end } = getMonthGridRange(month);
	const days = eachDayOfInterval({ start, end });

	const eventsByDay = (day: Date): EventListItem[] =>
		events
			.filter((event) => isSameDay(new Date(event.startAt), day))
			.sort((a, b) => a.startAt.localeCompare(b.startAt));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="sm-display text-2xl capitalize">
					{format(month, "MMMM 'de' yyyy", { locale: ptBR })}
				</h2>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => onMonthChange(subMonths(month, 1))}
						aria-label="Mês anterior"
					>
						<ChevronLeft />
					</Button>
					<Button variant="outline" onClick={() => onMonthChange(new Date())}>
						Hoje
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={() => onMonthChange(addMonths(month, 1))}
						aria-label="Próximo mês"
					>
						<ChevronRight />
					</Button>
				</div>
			</div>

			<div className="overflow-hidden rounded-md border border-border">
				<div className="grid grid-cols-7 border-b border-border bg-muted/40">
					{WEEKDAY_LABELS.map((label) => (
						<div
							key={label}
							className="px-2 py-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground"
						>
							{label}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7">
					{days.map((day) => (
						<CalendarDayCell
							key={day.toISOString()}
							date={day}
							dayNumber={day.getDate()}
							isCurrentMonth={isSameMonth(day, month)}
							isToday={isToday(day)}
							events={eventsByDay(day)}
							currentUserId={currentUserId}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
