import { Pencil } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import type { ListIntakesStatus200 } from "#/http/types/ListIntakes";
import { PRACTICE_AREA_OPTIONS } from "./intake-form";
import { IntakeUpsertDialog } from "./intake-upsert-dialog";

type IntakeListItem = ListIntakesStatus200["data"][number];

type IntakeListProps = {
	clientId: string;
	intakes: IntakeListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const practiceAreaLabel = (value: string) =>
	PRACTICE_AREA_OPTIONS.find((option) => option.value === value)?.label ??
	value;

export const IntakeList = ({
	clientId,
	intakes,
	isPending,
	isError,
}: IntakeListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar os atendimentos. Tente novamente.
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

	if (!intakes || intakes.length === 0) {
		return (
			<p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
				Nenhum atendimento registrado ainda.
			</p>
		);
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Data</TableHead>
						<TableHead>Área</TableHead>
						<TableHead>Responsável</TableHead>
						<TableHead>Relato</TableHead>
						<TableHead>Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{intakes.map((intake) => (
						<TableRow key={intake.id}>
							<TableCell className="whitespace-nowrap">
								{dateFormatter.format(new Date(intake.createdAt))}
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{intake.practiceAreas.length === 0 ? (
										<span className="text-muted-foreground">—</span>
									) : (
										intake.practiceAreas.map((area) => (
											<Badge key={area} variant="neutral">
												{practiceAreaLabel(area)}
											</Badge>
										))
									)}
								</div>
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{intake.user.name}
							</TableCell>
							<TableCell
								className="max-w-xs truncate"
								title={intake.clientReport ?? undefined}
							>
								{intake.clientReport ?? "—"}
							</TableCell>
							<TableCell>
								<IntakeUpsertDialog clientId={clientId} intake={intake}>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Editar atendimento"
									>
										<Pencil />
									</Button>
								</IntakeUpsertDialog>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
