import { useQueryClient } from "@tanstack/react-query";
import { Eye, Mail, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useCreateIntakePreviewLink } from "#/http/hooks/useCreateIntakePreviewLink";
import { useDeleteIntake } from "#/http/hooks/useDeleteIntake";
import { useSendIntakeEmail } from "#/http/hooks/useSendIntakeEmail";
import type { ListIntakesStatus200 } from "#/http/types/ListIntakes";
import { getApiErrorMessage } from "#/lib/api-error";

import { IntakeUpsertDialog } from "./intake-upsert-dialog";

type IntakeListItem = ListIntakesStatus200["data"][number];

type IntakeActionsMenuProps = {
	clientId: string;
	intake: IntakeListItem;
};

export const IntakeActionsMenu = ({
	clientId,
	intake,
}: IntakeActionsMenuProps) => {
	const queryClient = useQueryClient();

	const invalidateIntakes = () => {
		queryClient.invalidateQueries({
			queryKey: [{ url: "/clients/:clientId/intakes" }],
		});
	};

	const { mutate: createPreviewLink } = useCreateIntakePreviewLink({
		mutation: {
			onSuccess: (data) => {
				window.open(data.url, "_blank", "noopener,noreferrer");
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(
						error,
						"Não foi possível gerar o link de visualização",
					),
				);
			},
		},
	});

	const { mutate: sendEmail, isPending: isSendingEmail } = useSendIntakeEmail({
		mutation: {
			onSuccess: (data) => {
				toast.success(`E-mail enviado para ${data.sentTo}`);
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível enviar o e-mail"),
				);
			},
		},
	});

	const { mutate: deleteIntake, isPending: isDeleting } = useDeleteIntake({
		mutation: {
			onSuccess: () => {
				invalidateIntakes();
				toast.success("Atendimento excluído com sucesso");
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir o atendimento"),
				);
			},
		},
	});

	return (
		<AlertDialog>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" aria-label="Ações do atendimento">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<IntakeUpsertDialog clientId={clientId} intake={intake}>
						<DropdownMenuItem onSelect={(event) => event.preventDefault()}>
							<Pencil />
							Editar
						</DropdownMenuItem>
					</IntakeUpsertDialog>

					<DropdownMenuItem
						onSelect={(event) => {
							event.preventDefault();
							createPreviewLink({ path: { id: intake.id } });
						}}
					>
						<Eye />
						Visualizar
					</DropdownMenuItem>

					<DropdownMenuItem
						disabled={isSendingEmail}
						onSelect={(event) => {
							event.preventDefault();
							sendEmail({ path: { id: intake.id } });
						}}
					>
						<Mail />
						{isSendingEmail ? "Enviando..." : "Enviar por e-mail"}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

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
					<AlertDialogTitle>Excluir atendimento?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação não pode ser desfeita. O registro do atendimento será
						removido permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={isDeleting}
						onClick={() => deleteIntake({ path: { id: intake.id } })}
					>
						{isDeleting ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
