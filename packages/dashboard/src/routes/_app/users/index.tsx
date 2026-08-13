import { createFileRoute, redirect } from "@tanstack/react-router";
import { Plus, UserRound } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
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
import { getMeQueryOptions } from "#/http/hooks/useGetMe";
import { useListUsers } from "#/http/hooks/useListUsers";
import type { GetMeStatus200 } from "#/http/types/GetMe";

import { UserUpsertDialog } from "./-components/user-upsert-dialog";

const ROLE_LABEL: Record<string, string> = {
	ADMIN: "Administrador",
	MEMBER: "Membro",
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const UsersRoute = () => {
	const { data, isPending, isError } = useListUsers();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Usuários</p>
					<h1 className="sm-display text-3xl md:text-4xl">Usuários</h1>
					<div className="sm-rule" />
				</div>

				<UserUpsertDialog>
					<Button>
						<Plus />
						Novo usuário
					</Button>
				</UserUpsertDialog>
			</div>

			{isError ? (
				<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					Não foi possível carregar os usuários. Tente novamente.
				</p>
			) : isPending ? (
				<div className="flex flex-col gap-2">
					{SKELETON_ROWS.map((row) => (
						<Skeleton key={row} className="h-11 w-full" />
					))}
				</div>
			) : data.data.length === 0 ? (
				<EmptyState icon={UserRound} title="Nenhum usuário cadastrado ainda." />
			) : (
				<div className="rounded-md border border-border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nome</TableHead>
								<TableHead>E-mail</TableHead>
								<TableHead>Papel</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Criado em</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.data.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{ROLE_LABEL[user.role] ?? user.role}</TableCell>
									<TableCell>
										<Badge variant={user.isActive ? "success" : "warning"}>
											{user.isActive ? "Ativo" : "Pendente de ativação"}
										</Badge>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										{dateFormatter.format(new Date(user.createdAt))}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_app/users/")({
	beforeLoad: async ({ context }) => {
		let user: GetMeStatus200;

		try {
			user = await context.queryClient.ensureQueryData({
				...getMeQueryOptions(),
				retry: false,
			});
		} catch {
			throw redirect({ to: "/sign-in" });
		}

		if (user.role !== "ADMIN") {
			throw redirect({ to: "/" });
		}
	},
	component: UsersRoute,
	head: () => ({ meta: [{ title: "Usuários | Silveira & Monteiro" }] }),
});
