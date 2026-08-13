import { useQueryClient } from "@tanstack/react-query";
import { File as FileIcon, UploadCloud, X } from "lucide-react";
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

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

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
		return "Arquivo excede o tamanho máximo permitido (20MB).";
	}

	return null;
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
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [progress, setProgress] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const queryClient = useQueryClient();

	const reset = () => {
		setFile(null);
		setError(null);
		setProgress(0);
		setIsDraggingOver(false);
	};

	const { mutate, isPending } = useUploadDocument({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: listDocumentsQueryKey({ path: { clientId } }),
				});
				toast.success("Documento enviado com sucesso");
				reset();
				setOpen(false);
			},
			onError: (uploadError) => {
				toast.error(
					getApiErrorMessage(
						uploadError,
						"Não foi possível enviar o documento",
					),
				);
				setProgress(0);
			},
		},
	});

	const acceptFile = (candidate: File | undefined) => {
		if (!candidate) {
			return;
		}

		const validationError = validateFile(candidate);

		if (validationError) {
			setError(validationError);
			setFile(null);
			return;
		}

		setError(null);
		setFile(candidate);
	};

	const handleSubmit = () => {
		if (!file) {
			return;
		}

		mutate({ clientId, companyId, file, onProgress: setProgress });
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
					<DialogTitle>Enviar documento</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-3">
					{file ? (
						<div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<FileIcon className="size-5" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-foreground">
									{file.name}
								</p>
								<p className="text-xs text-muted-foreground">
									{formatFileSize(file.size)}
								</p>
							</div>
							{!isPending ? (
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="size-8 shrink-0"
									onClick={() => setFile(null)}
									aria-label="Remover arquivo"
								>
									<X className="size-4" />
								</Button>
							) : null}
						</div>
					) : (
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
								acceptFile(event.dataTransfer.files?.[0]);
							}}
							className={cn(
								"flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-10 text-center transition-colors",
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
								Arraste um arquivo aqui
							</p>
							<p className="text-xs text-muted-foreground">
								ou clique para selecionar — PDF, imagem, Word ou Excel, até 20MB
							</p>
						</button>
					)}

					<input
						ref={inputRef}
						type="file"
						className="hidden"
						accept={ACCEPTED_EXTENSIONS.join(",")}
						onChange={(event) => acceptFile(event.target.files?.[0])}
					/>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					{isPending ? <Progress value={progress} /> : null}

					<Button
						type="button"
						disabled={!file || isPending}
						onClick={handleSubmit}
						className="mt-1"
					>
						{isPending ? `Enviando... ${progress}%` : "Enviar"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
