import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { listDocumentsQueryKey } from "#/http/hooks/useListDocuments";
import { getApiErrorMessage } from "#/lib/api-error";

import { useUploadDocument } from "../-hooks/use-upload-document";

type DocumentUploadFormInput = {
	file: FileList | undefined;
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
	const queryClient = useQueryClient();

	const form = useForm<DocumentUploadFormInput>({
		defaultValues: { file: undefined },
	});

	const { mutate, isPending } = useUploadDocument({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: listDocumentsQueryKey({
						path: { clientId },
						query: { companyId },
					}),
				});
				toast.success("Documento enviado com sucesso");
				form.reset();
				setOpen(false);
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível enviar o documento"),
				);
			},
		},
	});

	const onSubmit = (values: DocumentUploadFormInput) => {
		const file = values.file?.[0];

		if (!file) {
			return;
		}

		mutate({ clientId, companyId, file });
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enviar documento</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<FormField
							control={form.control}
							name="file"
							rules={{ required: "Selecione um arquivo" }}
							render={({ field: { onChange, onBlur, name, ref } }) => (
								<FormItem>
									<FormLabel>Arquivo</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
											name={name}
											ref={ref}
											onBlur={onBlur}
											aria-invalid={Boolean(form.formState.errors.file)}
											onChange={(event) => onChange(event.target.files)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isPending} className="mt-2">
							{isPending ? "Enviando..." : "Enviar"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
