import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";

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
import type { ListClientsStatus200 } from "#/http/types/ListClients";

type ClientListItem = ListClientsStatus200["data"][number];

type ClientListProps = {
	clients: ClientListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3", "row-4", "row-5"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export const ClientList = ({
	clients,
	isPending,
	isError,
}: ClientListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar os clientes. Tente novamente.
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

	if (!clients || clients.length === 0) {
		return <EmptyState icon={Users} title="Nenhum cliente cadastrado ainda." />;
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead>CPF</TableHead>
						<TableHead>Telefone</TableHead>
						<TableHead>E-mail</TableHead>
						<TableHead>Cadastrado em</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{clients.map((client) => (
						<TableRow key={client.id}>
							<TableCell className="font-medium text-foreground">
								<Link
									to="/clients/$client_id"
									params={{ client_id: client.id }}
									className="hover:underline"
								>
									{client.fullName}
								</Link>
							</TableCell>
							<TableCell>{client.cpf}</TableCell>
							<TableCell>{client.phone ?? "—"}</TableCell>
							<TableCell>{client.email ?? "—"}</TableCell>
							<TableCell>
								{dateFormatter.format(new Date(client.createdAt))}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
