import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import { useGetMe } from "#/http/hooks/useGetMe";
import { useListEvents } from "#/http/hooks/useListEvents";

import {
	CalendarMonthGrid,
	getMonthGridRange,
} from "./-components/calendar-month-grid";
import { EventUpsertDialog } from "./-components/event-upsert-dialog";

const CalendarRoute = () => {
	const [month, setMonth] = useState(() => new Date());
	const { data: currentUser } = useGetMe();

	const { start, end } = getMonthGridRange(month);

	const { data, isPending, isError } = useListEvents({
		query: { from: start.toISOString(), to: end.toISOString() },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Calendário</p>
					<h1 className="sm-display text-3xl md:text-4xl">Calendário</h1>
					<div className="sm-rule" />
				</div>

				<EventUpsertDialog>
					<Button>
						<Plus />
						Novo evento
					</Button>
				</EventUpsertDialog>
			</div>

			{isError ? (
				<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					Não foi possível carregar os eventos. Tente novamente.
				</p>
			) : (
				<CalendarMonthGrid
					month={month}
					onMonthChange={setMonth}
					events={isPending ? [] : (data?.data ?? [])}
					currentUserId={currentUser?.id}
				/>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_app/calendar/")({
	component: CalendarRoute,
	head: () => ({ meta: [{ title: "Calendário | Silveira & Monteiro" }] }),
});
