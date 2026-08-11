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

import { ClientStatusBadge } from "./client-status-badge";

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
		return (
			<p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
				Nenhum cliente cadastrado ainda.
			</p>
		);
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
						<TableHead>Status</TableHead>
						<TableHead>Cadastrado em</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{clients.map((client) => (
						<TableRow key={client.id}>
							<TableCell className="font-medium text-foreground">
								{client.fullName}
							</TableCell>
							<TableCell>{client.cpf}</TableCell>
							<TableCell>{client.phone ?? "—"}</TableCell>
							<TableCell>{client.email ?? "—"}</TableCell>
							<TableCell>
								<ClientStatusBadge isActive={client.isActive} />
							</TableCell>
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
