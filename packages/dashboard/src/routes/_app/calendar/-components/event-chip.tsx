import { Megaphone } from "lucide-react";
import type { ListEventsStatus200 } from "#/http/types/ListEvents";
import { cn } from "#/lib/utils";

import { EventUpsertDialog } from "./event-upsert-dialog";

type EventListItem = ListEventsStatus200["data"][number];

type EventChipProps = {
	event: EventListItem;
	currentUserId: string | undefined;
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
	hour: "2-digit",
	minute: "2-digit",
});

export const EventChip = ({ event, currentUserId }: EventChipProps) => {
	const isOwner = event.userId === currentUserId;

	const chipContent = (
		<span
			className={cn(
				"flex w-full items-center gap-1 truncate rounded-sm px-1.5 py-0.5 text-left text-xs font-medium",
				event.isGlobal
					? "bg-accent text-accent-foreground"
					: "bg-primary/10 text-primary",
			)}
		>
			{event.isGlobal ? <Megaphone className="size-3 shrink-0" /> : null}
			<span className="shrink-0">
				{timeFormatter.format(new Date(event.startAt))}
			</span>
			<span className="truncate">{event.title}</span>
		</span>
	);

	if (!isOwner) {
		return chipContent;
	}

	return (
		<EventUpsertDialog event={event}>
			<button type="button" className="w-full">
				{chipContent}
			</button>
		</EventUpsertDialog>
	);
};
