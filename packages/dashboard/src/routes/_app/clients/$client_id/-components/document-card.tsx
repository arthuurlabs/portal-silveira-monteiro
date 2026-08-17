import { useQueryClient } from "@tanstack/react-query";
import {
	Download,
	File,
	FileSpreadsheet,
	FileText,
	Image as ImageIcon,
	MoreHorizontal,
	Trash2,
} from "lucide-react";
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
import { useDeleteDocument } from "#/http/hooks/useDeleteDocument";
import { listDocumentsQueryKey } from "#/http/hooks/useListDocuments";
import type { ListDocumentsStatus200 } from "#/http/types/ListDocuments";
import { apiBaseUrl } from "#/lib/api-client";
import { getApiErrorMessage } from "#/lib/api-error";
import { cn } from "#/lib/utils";

type DocumentListItem = ListDocumentsStatus200["data"][number];

type DocumentCardProps = {
	clientId: string;
	companyId?: string;
	document: DocumentListItem;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FILE_TYPE_STYLES: Record<
	string,
	{ icon: typeof FileText; tint: string }
> = {
	"application/pdf": {
		icon: FileText,
		tint: "bg-destructive/10 text-destructive",
	},
	"application/msword": {
		icon: FileText,
		tint: "bg-primary/10 text-primary",
	},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
		icon: FileText,
		tint: "bg-primary/10 text-primary",
	},
	"application/vnd.ms-excel": {
		icon: FileSpreadsheet,
		tint: "bg-success/10 text-success",
	},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
		icon: FileSpreadsheet,
		tint: "bg-success/10 text-success",
	},
	"image/jpeg": { icon: ImageIcon, tint: "bg-accent/10 text-accent" },
	"image/png": { icon: ImageIcon, tint: "bg-accent/10 text-accent" },
};

const getFileTypeStyle = (mimeType: string) =>
	FILE_TYPE_STYLES[mimeType] ?? {
		icon: File,
		tint: "bg-muted text-muted-foreground",
	};

export const DocumentCard = ({ clientId, document }: DocumentCardProps) => {
	const queryClient = useQueryClient();

	const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: listDocumentsQueryKey({ path: { clientId } }),
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

	const { icon: Icon, tint } = getFileTypeStyle(document.mimeType);
	const downloadUrl = `${apiBaseUrl}/documents/${document.id}/download`;

	return (
		<AlertDialog>
			<div className="group relative flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-card">
				<a
					href={downloadUrl}
					target="_blank"
					rel="noreferrer"
					className="flex w-full flex-col items-center gap-2"
				>
					<span
						className={cn(
							"flex size-14 items-center justify-center rounded-xl",
							tint,
						)}
					>
						<Icon className="size-7" />
					</span>
					<span className="w-full">
						<span
							className="block truncate text-sm font-medium text-foreground"
							title={document.originalName}
						>
							{document.originalName}
						</span>
						<span className="block text-xs text-muted-foreground">
							{formatFileSize(document.size)} ·{" "}
							{dateFormatter.format(new Date(document.createdAt))}
						</span>
					</span>
				</a>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-1 right-1 size-7 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
							aria-label={`Ações de ${document.originalName}`}
						>
							<MoreHorizontal className="size-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem asChild>
							<a href={downloadUrl} target="_blank" rel="noreferrer">
								<Download />
								Baixar
							</a>
						</DropdownMenuItem>
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
			</div>

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
	);
};
