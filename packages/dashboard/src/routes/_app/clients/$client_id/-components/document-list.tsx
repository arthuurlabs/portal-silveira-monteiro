import { useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { useDeleteDocument } from "#/http/hooks/useDeleteDocument";
import { listDocumentsQueryKey } from "#/http/hooks/useListDocuments";
import type { ListDocumentsStatus200 } from "#/http/types/ListDocuments";
import { getApiErrorMessage } from "#/lib/api-error";

type DocumentListItem = ListDocumentsStatus200["data"][number];

type DocumentListProps = {
	clientId: string;
	companyId?: string;
	documents: DocumentListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_ROWS = ["row-1", "row-2", "row-3"];

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentRowActions = ({
	clientId,
	companyId,
	document,
}: {
	clientId: string;
	companyId?: string;
	document: DocumentListItem;
}) => {
	const queryClient = useQueryClient();

	const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: listDocumentsQueryKey({
						path: { clientId },
						query: { companyId },
					}),
				});
				toast.success("Documento excluído com sucesso");
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir o documento"),
				);
			},
		},
	});

	return (
		<div className="flex items-center justify-end gap-2">
			<a
				href={`${import.meta.env.VITE_API_URL}/documents/${document.id}/download`}
				target="_blank"
				rel="noreferrer"
				aria-label={`Baixar ${document.originalName}`}
				className={buttonVariants({ variant: "ghost", size: "icon" })}
			>
				<Download />
			</a>

			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Excluir ${document.originalName}`}
					>
						<Trash2 />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir documento?</AlertDialogTitle>
						<AlertDialogDescription>
							Essa ação não pode ser desfeita. O documento será removido
							permanentemente.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isDeleting}
							onClick={() => deleteDocument({ path: { id: document.id } })}
						>
							{isDeleting ? "Excluindo..." : "Excluir"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export const DocumentList = ({
	clientId,
	companyId,
	documents,
	isPending,
	isError,
}: DocumentListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar os documentos. Tente novamente.
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

	if (!documents || documents.length === 0) {
		return (
			<p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
				Nenhum documento enviado ainda.
			</p>
		);
	}

	return (
		<div className="rounded-md border border-border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nome</TableHead>
						<TableHead>Tamanho</TableHead>
						<TableHead>Enviado em</TableHead>
						<TableHead className="text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{documents.map((document) => (
						<TableRow key={document.id}>
							<TableCell className="font-medium">
								{document.originalName}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{formatFileSize(document.size)}
							</TableCell>
							<TableCell className="whitespace-nowrap">
								{dateTimeFormatter.format(new Date(document.createdAt))}
							</TableCell>
							<TableCell>
								<DocumentRowActions
									clientId={clientId}
									companyId={companyId}
									document={document}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
