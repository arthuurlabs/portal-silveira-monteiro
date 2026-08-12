import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { ListEventsStatus200 } from "#/http/types/ListEvents";

import { EventForm } from "./event-form";

type EventListItem = ListEventsStatus200["data"][number];

type EventUpsertDialogProps = {
	event?: EventListItem;
	defaultDate?: Date;
	children: React.ReactNode;
};

export const EventUpsertDialog = ({
	event,
	defaultDate,
	children,
}: EventUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
				</DialogHeader>
				<EventForm
					event={event}
					defaultDate={defaultDate}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
