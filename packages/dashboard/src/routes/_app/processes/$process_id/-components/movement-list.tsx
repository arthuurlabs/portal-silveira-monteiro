import { History } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import type { ListProcessMovementsStatus200 } from "#/http/types/ListProcessMovements";
import { formatDate } from "#/lib/format-date";

type MovementListItem = ListProcessMovementsStatus200["data"][number];

type MovementListProps = {
	movements: MovementListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3"];

export const MovementList = ({
	movements,
	isPending,
	isError,
}: MovementListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar as movimentações. Tente novamente.
			</p>
		);
	}

	if (isPending) {
		return (
			<div className="flex flex-col gap-2">
				{SKELETON_ROWS.map((row) => (
					<Skeleton key={row} className="h-11 w-full" />
				))}
			</div>
		);
	}

	if (!movements || movements.length === 0) {
		return (
			<EmptyState
				icon={History}
				title="Nenhuma movimentação registrada ainda."
			/>
		);
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-32">Data</TableHead>
						<TableHead>Descrição</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{movements.map((movement) => (
						<TableRow key={movement.id}>
							<TableCell className="whitespace-nowrap align-top">
								{formatDate(movement.occurredAt)}
							</TableCell>
							<TableCell className="whitespace-pre-wrap">
								{movement.description}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
