import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Button, buttonVariants } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { ResponseError } from "#/http/.kubb/client";
import { useDeleteProcess } from "#/http/hooks/useDeleteProcess";
import { useGetProcess } from "#/http/hooks/useGetProcess";
import { useListProcessMovements } from "#/http/hooks/useListProcessMovements";
import { getApiErrorMessage } from "#/lib/api-error";
import { ProcessUpsertDialog } from "../-components/process-upsert-dialog";
import { AddMovementDialog } from "./-components/add-movement-dialog";
import { MovementList } from "./-components/movement-list";

const ProcessDetailRoute = () => {
	const { process_id: processId } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		data: process,
		isPending,
		isError,
		error,
	} = useGetProcess({ path: { id: processId } });

	const movementsQuery = useListProcessMovements({ path: { processId } });

	const { mutate: deleteProcess, isPending: isDeleting } = useDeleteProcess({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [{ url: "/processes" }] });
				toast.success("Processo excluído com sucesso");
				navigate({ to: "/processes" });
			},
			onError: (mutationError) => {
				toast.error(
					getApiErrorMessage(
						mutationError,
						"Não foi possível excluir o processo",
					),
				);
			},
		},
	});

	if (isPending) {
		return (
			<div className="flex flex-col gap-6">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}

	if (isError) {
		const isNotFound = error instanceof ResponseError && error.status === 404;

		return (
			<div className="flex flex-col items-center gap-3 py-16 text-center">
				<p className="text-lg font-medium text-foreground">
					{isNotFound
						? "Processo não encontrado"
						: "Não foi possível carregar o processo"}
				</p>
				<p className="text-sm text-muted-foreground">
					{isNotFound
						? "O processo que você está procurando não existe ou foi removido."
						: "Tente novamente em instantes."}
				</p>
				<Link
					to="/processes"
					className={buttonVariants({ variant: "outline", className: "mt-2" })}
				>
					Voltar para processos
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Link
				to="/processes"
				className="w-fit text-sm text-muted-foreground hover:text-foreground"
			>
				← Voltar para processos
			</Link>

			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-2">
					<p className="sm-eyebrow">Processo</p>
					<h1 className="sm-display text-3xl md:text-4xl">
						{process.caseNumber ?? "Sem número"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Cliente:{" "}
						<Link
							to="/clients/$client_id"
							params={{ client_id: process.clientId }}
							className="hover:underline"
						>
							{process.client.fullName}
						</Link>
					</p>
				</div>

				<div className="flex items-center gap-2">
					<ProcessUpsertDialog process={process}>
						<Button variant="outline">
							<Pencil />
							Editar
						</Button>
					</ProcessUpsertDialog>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline">
								<Trash2 />
								Excluir
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Excluir processo?</AlertDialogTitle>
								<AlertDialogDescription>
									Essa ação não pode ser desfeita. O processo e suas
									movimentações serão removidos permanentemente.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									disabled={isDeleting}
									onClick={() => deleteProcess({ path: { id: processId } })}
								>
									{isDeleting ? "Excluindo..." : "Excluir"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<div className="grid gap-4 rounded-md border border-border p-5 sm:grid-cols-2">
				<div>
					<p className="sm-eyebrow">Autor</p>
					<p className="mt-1 text-sm text-foreground">{process.plaintiff}</p>
				</div>
				<div>
					<p className="sm-eyebrow">Réu</p>
					<p className="mt-1 text-sm text-foreground">{process.defendant}</p>
				</div>
				<div>
					<p className="sm-eyebrow">Responsável</p>
					<p className="mt-1 text-sm text-foreground">{process.user.name}</p>
				</div>
				{process.notes ? (
					<div className="sm:col-span-2">
						<p className="sm-eyebrow">Observações</p>
						<p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
							{process.notes}
						</p>
					</div>
				) : null}
			</div>

			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between gap-4">
					<h2 className="font-display text-xl font-medium tracking-tight">
						Movimentações
					</h2>

					<AddMovementDialog processId={processId}>
						<Button variant="outline" size="sm">
							<Plus />
							Nova movimentação
						</Button>
					</AddMovementDialog>
				</div>

				<MovementList
					movements={movementsQuery.data?.data}
					isPending={movementsQuery.isPending}
					isError={movementsQuery.isError}
				/>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_app/processes/$process_id/")({
	component: ProcessDetailRoute,
	head: () => ({ meta: [{ title: "Processo | Silveira & Monteiro" }] }),
});
