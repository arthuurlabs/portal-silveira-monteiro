import { Link } from "@tanstack/react-router";
import { Gavel } from "lucide-react";

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
import type { ListProcessesStatus200 } from "#/http/types/ListProcesses";

type ProcessListItem = ListProcessesStatus200["data"][number];

type ProcessListProps = {
	processes: ProcessListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export const ProcessList = ({
	processes,
	isPending,
	isError,
}: ProcessListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar os processos. Tente novamente.
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

	if (!processes || processes.length === 0) {
		return (
			<EmptyState icon={Gavel} title="Nenhum processo cadastrado ainda." />
		);
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Número do processo</TableHead>
						<TableHead>Autor</TableHead>
						<TableHead>Réu</TableHead>
						<TableHead>Cliente</TableHead>
						<TableHead>Responsável</TableHead>
						<TableHead>Criado em</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{processes.map((process) => (
						<TableRow key={process.id}>
							<TableCell className="font-medium text-foreground">
								<Link
									to="/processes/$process_id"
									params={{ process_id: process.id }}
									className="hover:underline"
								>
									{process.caseNumber ?? "—"}
								</Link>
							</TableCell>
							<TableCell>{process.plaintiff}</TableCell>
							<TableCell>{process.defendant}</TableCell>
							<TableCell>{process.client.fullName}</TableCell>
							<TableCell className="whitespace-nowrap">
								{process.user.name}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{dateFormatter.format(new Date(process.createdAt))}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
