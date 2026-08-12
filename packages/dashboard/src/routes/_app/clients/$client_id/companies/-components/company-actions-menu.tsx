import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useDeleteCompany } from "#/http/hooks/useDeleteCompany";
import type { ListCompaniesStatus200 } from "#/http/types/ListCompanies";
import { getApiErrorMessage } from "#/lib/api-error";

import { CompanyUpsertDialog } from "./company-upsert-dialog";

type CompanyListItem = ListCompaniesStatus200["data"][number];

type CompanyActionsMenuProps = {
	clientId: string;
	company: CompanyListItem;
};

export const CompanyActionsMenu = ({
	clientId,
	company,
}: CompanyActionsMenuProps) => {
	const queryClient = useQueryClient();

	const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [{ url: "/clients/:clientId/companies" }],
				});
				toast.success("Empresa excluída com sucesso");
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir a empresa"),
				);
			},
		},
	});

	return (
		<AlertDialog>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Ações da empresa">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<CompanyUpsertDialog clientId={clientId} company={company}>
						<DropdownMenuItem onSelect={(event) => event.preventDefault()}>
							<Pencil />
							Editar
						</DropdownMenuItem>
					</CompanyUpsertDialog>

					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							variant="destructive"
							onSelect={(event) => event.preventDefault()}
						>
							<Trash2 />
							Excluir
						</DropdownMenuItem>
					</AlertDialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação não pode ser desfeita. A empresa será removida
						permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isDeleting}
						onClick={() => deleteCompany({ path: { id: company.id } })}
					>
						{isDeleting ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
