import { Link } from "@tanstack/react-router";
import { AlertCircle, Users } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
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
import { formatCnpj, formatCpf } from "#/lib/masks";

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
			<Alert variant="danger">
				<AlertCircle />
				<AlertDescription>
					Não foi possível carregar os clientes. Tente novamente.
				</AlertDescription>
			</Alert>
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
						<TableHead>Tipo</TableHead>
						<TableHead>Documento</TableHead>
						<TableHead>Telefone</TableHead>
						<TableHead>E-mail</TableHead>
						<TableHead>Cadastrado em</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{clients.map((client) => {
						const isJuridica = client.personType === "JURIDICA";

						return (
							<TableRow key={client.id}>
								<TableCell className="font-medium text-foreground">
									<Link
										to="/clients/$client_id"
										params={{ client_id: client.id }}
										className="hover:underline"
									>
										{isJuridica ? client.razaoSocial : client.fullName}
									</Link>
									{isJuridica && client.nomeFantasia ? (
										<span className="block text-xs font-normal text-muted-foreground">
											{client.nomeFantasia}
										</span>
									) : null}
								</TableCell>
								<TableCell>
									<Badge variant="neutral">{isJuridica ? "PJ" : "PF"}</Badge>
								</TableCell>
								<TableCell>
									{isJuridica ? formatCnpj(client.cnpj) : formatCpf(client.cpf)}
								</TableCell>
								<TableCell>{client.phone ?? "—"}</TableCell>
								<TableCell>{client.email ?? "—"}</TableCell>
								<TableCell>
									{dateFormatter.format(new Date(client.createdAt))}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};
