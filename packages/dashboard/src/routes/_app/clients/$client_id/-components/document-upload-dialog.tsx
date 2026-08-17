import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, File as FileIcon, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Progress } from "#/components/ui/progress";
import { listDocumentsQueryKey } from "#/http/hooks/useListDocuments";
import { getApiErrorMessage } from "#/lib/api-error";
import { cn } from "#/lib/utils";

import { useUploadDocument } from "../-hooks/use-upload-document";

const ACCEPTED_EXTENSIONS = [
	".pdf",
	".jpg",
	".jpeg",
	".png",
	".doc",
	".docx",
	".xls",
	".xlsx",
];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const validateFile = (file: File): string | null => {
	const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

	if (!ACCEPTED_EXTENSIONS.includes(extension)) {
		return "Tipo de arquivo não permitido. Use PDF, imagem, Word ou Excel.";
	}

	if (file.size > MAX_FILE_SIZE_BYTES) {
		return "Arquivo excede o tamanho máximo permitido (50MB).";
	}

	return null;
};

type UploadItemStatus = "pending" | "uploading" | "done" | "error" | "invalid";

type UploadItem = {
	id: string;
	file: File;
	status: UploadItemStatus;
	progress: number;
	error?: string;
};

type DocumentUploadDialogProps = {
	clientId: string;
	companyId?: string;
	children: React.ReactNode;
};

export const DocumentUploadDialog = ({
	clientId,
	companyId,
	children,
}: DocumentUploadDialogProps) => {
	const [open, setOpen] = useState(false);
	const [items, setItems] = useState<UploadItem[]>([]);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const reset = () => {
		setItems([]);
		setIsDraggingOver(false);
	};

	const { mutateAsync } = useUploadDocument();

	const updateItem = (id: string, patch: Partial<UploadItem>) => {
		setItems((prev) =>
			prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
		);
	};

	const acceptFiles = (candidates: FileList | null | undefined) => {
		if (!candidates || candidates.length === 0) {
			return;
		}

		const newItems: UploadItem[] = Array.from(candidates).map((file) => {
			const validationError = validateFile(file);

			return {
				id: crypto.randomUUID(),
				file,
				status: validationError ? "invalid" : "pending",
				progress: 0,
				error: validationError ?? undefined,
			};
		});

		setItems((prev) => [...prev, ...newItems]);
	};

	const isUploading = items.some((item) => item.status === "uploading");
	const retryableItems = items.filter(
		(item) => item.status === "pending" || item.status === "error",
	);

	const handleSubmit = async () => {
		if (retryableItems.length === 0 || isUploading) {
			return;
		}

		const retryableIds = new Set(retryableItems.map((item) => item.id));
		setItems((prev) =>
			prev.map((item) =>
				retryableIds.has(item.id)
					? { ...item, status: "uploading", progress: 0, error: undefined }
					: item,
			),
		);

		const results = await Promise.allSettled(
			retryableItems.map((item) =>
				mutateAsync({
					clientId,
					companyId,
					file: item.file,
					onProgress: (percent) => updateItem(item.id, { progress: percent }),
				})
					.then(() => updateItem(item.id, { status: "done", progress: 100 }))
					.catch((uploadError) => {
						updateItem(item.id, {
							status: "error",
							error: getApiErrorMessage(
								uploadError,
								"Não foi possível enviar o documento",
							),
						});
						throw uploadError;
					}),
			),
		);

		queryClient.invalidateQueries({
			queryKey: listDocumentsQueryKey({ path: { clientId } }),
		});

		const successCount = results.filter(
			(result) => result.status === "fulfilled",
		).length;

		if (successCount === retryableItems.length) {
			toast.success(
				retryableItems.length === 1
					? "Documento enviado com sucesso"
					: `${retryableItems.length} documentos enviados com sucesso`,
			);
			reset();
			setOpen(false);
			return;
		}

		toast.error(
			`${successCount} de ${retryableItems.length} documentos enviados`,
		);
		setItems((prev) => prev.filter((item) => item.status !== "done"));
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					reset();
				}
			}}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enviar documentos</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-3">
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						onDragEnter={(event) => {
							event.preventDefault();
							setIsDraggingOver(true);
						}}
						onDragOver={(event) => event.preventDefault()}
						onDragLeave={() => setIsDraggingOver(false)}
						onDrop={(event) => {
							event.preventDefault();
							setIsDraggingOver(false);
							acceptFiles(event.dataTransfer.files);
						}}
						className={cn(
							"flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors",
							isDraggingOver
								? "border-primary bg-primary/5"
								: "hover:border-primary/40 hover:bg-muted/40",
						)}
					>
						<UploadCloud
							className={cn(
								"size-8",
								isDraggingOver ? "text-primary" : "text-muted-foreground",
							)}
						/>
						<p className="text-sm font-medium text-foreground">
							Arraste um ou mais arquivos aqui
						</p>
						<p className="text-xs text-muted-foreground">
							ou clique para selecionar — PDF, imagem, Word ou Excel, até 50MB
							cada
						</p>
					</button>

					<input
						ref={inputRef}
						type="file"
						multiple
						className="hidden"
						accept={ACCEPTED_EXTENSIONS.join(",")}
						onChange={(event) => {
							acceptFiles(event.target.files);
							event.target.value = "";
						}}
					/>

					{items.length > 0 ? (
						<div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
								>
									<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<FileIcon className="size-5" />
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-foreground">
											{item.file.name}
										</p>
										{item.status === "invalid" || item.status === "error" ? (
											<p className="text-xs text-destructive">{item.error}</p>
										) : (
											<p className="text-xs text-muted-foreground">
												{formatFileSize(item.file.size)}
											</p>
										)}
										{item.status === "uploading" ? (
											<Progress
												value={item.progress}
												className="mt-1.5 h-1.5"
											/>
										) : null}
									</div>
									{item.status === "done" ? (
										<CheckCircle2 className="size-5 shrink-0 text-success" />
									) : item.status === "uploading" ? (
										<span className="shrink-0 text-xs text-muted-foreground">
											{item.progress}%
										</span>
									) : (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="size-8 shrink-0"
											onClick={() =>
												setItems((prev) =>
													prev.filter((current) => current.id !== item.id),
												)
											}
											aria-label={`Remover ${item.file.name}`}
										>
											<X className="size-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					) : null}

					<Button
						type="button"
						disabled={retryableItems.length === 0 || isUploading}
						onClick={handleSubmit}
						className="mt-1"
					>
						{isUploading
							? "Enviando..."
							: retryableItems.length > 1
								? `Enviar ${retryableItems.length} arquivos`
								: "Enviar"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
