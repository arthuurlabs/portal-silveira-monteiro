import { useState } from "react";
import type { ListEventsStatus200 } from "#/http/types/ListEvents";
import { cn } from "#/lib/utils";

import { EventChip } from "./event-chip";
import { EventUpsertDialog } from "./event-upsert-dialog";

type EventListItem = ListEventsStatus200["data"][number];

type CalendarDayCellProps = {
	date: Date;
	dayNumber: number;
	isCurrentMonth: boolean;
	isToday: boolean;
	events: EventListItem[];
	currentUserId: string | undefined;
};

const VISIBLE_EVENTS_LIMIT = 3;

export const CalendarDayCell = ({
	date,
	dayNumber,
	isCurrentMonth,
	isToday,
	events,
	currentUserId,
}: CalendarDayCellProps) => {
	const [expanded, setExpanded] = useState(false);

	const visibleEvents = expanded
		? events
		: events.slice(0, VISIBLE_EVENTS_LIMIT);
	const hiddenCount = events.length - visibleEvents.length;

	return (
		<div
			className={cn(
				"flex min-h-28 flex-col gap-1 border-b border-r border-border p-1.5",
				!isCurrentMonth && "bg-muted/40",
			)}
		>
			<div className="flex items-center justify-between">
				<EventUpsertDialog defaultDate={date}>
					<button
						type="button"
						className={cn(
							"flex size-6 items-center justify-center rounded-full text-xs font-medium hover:bg-muted",
							!isCurrentMonth && "text-muted-foreground",
							isToday &&
								"bg-primary text-primary-foreground hover:bg-primary/90",
						)}
						aria-label="Novo evento neste dia"
					>
						{dayNumber}
					</button>
				</EventUpsertDialog>
			</div>

			<div className="flex flex-col gap-1">
				{visibleEvents.map((event) => (
					<EventChip
						key={event.id}
						event={event}
						currentUserId={currentUserId}
					/>
				))}

				{hiddenCount > 0 ? (
					<button
						type="button"
						onClick={() => setExpanded(true)}
						className="text-left text-xs text-muted-foreground hover:text-foreground"
					>
						+{hiddenCount} mais
					</button>
				) : null}
			</div>
		</div>
	);
};
