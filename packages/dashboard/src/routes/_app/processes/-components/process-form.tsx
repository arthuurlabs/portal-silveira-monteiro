import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { useCreateProcess } from "#/http/hooks/useCreateProcess";
import { getProcessQueryKey } from "#/http/hooks/useGetProcess";
import { useListClients } from "#/http/hooks/useListClients";
import { useUpdateProcess } from "#/http/hooks/useUpdateProcess";
import type { ListProcessesStatus200 } from "#/http/types/ListProcesses";
import { getApiErrorMessage } from "#/lib/api-error";

type ProcessListItem = ListProcessesStatus200["data"][number];

const processFormSchema = z.object({
	caseNumber: z.string().trim(),
	clientId: z.string().min(1, "Selecione o cliente"),
	plaintiff: z.string().trim().min(1, "Informe o autor"),
	defendant: z.string().trim().min(1, "Informe o réu"),
	notes: z.string().trim(),
});

type ProcessFormInput = z.infer<typeof processFormSchema>;

type ProcessFormProps = {
	process?: ProcessListItem;
	onSuccess: () => void;
};

export const ProcessForm = ({ process, onSuccess }: ProcessFormProps) => {
	const queryClient = useQueryClient();

	const { data: clients, isPending: isLoadingClients } = useListClients({
		query: { pageSize: 100, isActive: "true" },
	});

	const form = useForm<ProcessFormInput>({
		resolver: zodResolver(processFormSchema),
		defaultValues: {
			caseNumber: process?.caseNumber ?? "",
			clientId: process?.clientId ?? "",
			plaintiff: process?.plaintiff ?? "",
			defendant: process?.defendant ?? "",
			notes: process?.notes ?? "",
		},
	});

	const invalidateProcesses = () => {
		queryClient.invalidateQueries({ queryKey: [{ url: "/processes" }] });
	};

	const handleError = (error: unknown) => {
		toast.error(
			getApiErrorMessage(error, "Não foi possível salvar o processo"),
		);
	};

	const { mutate: createProcess, isPending: isCreating } = useCreateProcess({
		mutation: {
			onSuccess: () => {
				invalidateProcesses();
				toast.success("Processo criado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateProcess, isPending: isUpdating } = useUpdateProcess({
		mutation: {
			onSuccess: (_data, variables) => {
				invalidateProcesses();
				queryClient.invalidateQueries({
					queryKey: getProcessQueryKey({ path: { id: variables.path.id } }),
				});
				toast.success("Processo atualizado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const isPending = isCreating || isUpdating;

	const onSubmit = (values: ProcessFormInput) => {
		const body = {
			caseNumber: values.caseNumber || undefined,
			clientId: values.clientId,
			plaintiff: values.plaintiff,
			defendant: values.defendant,
			notes: values.notes || undefined,
		};

		if (process) {
			updateProcess({ path: { id: process.id }, body });
			return;
		}

		createProcess({ body });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="clientId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cliente</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue
											placeholder={
												isLoadingClients
													? "Carregando clientes..."
													: "Selecione o cliente"
											}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{clients?.data.map((client) => (
										<SelectItem key={client.id} value={client.id}>
											{client.fullName}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="caseNumber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Número do processo</FormLabel>
							<FormControl>
								<Input placeholder="0000000-00.0000.0.00.0000" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="plaintiff"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Autor</FormLabel>
								<FormControl>
									<Input
										aria-invalid={Boolean(form.formState.errors.plaintiff)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="defendant"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Réu</FormLabel>
								<FormControl>
									<Input
										aria-invalid={Boolean(form.formState.errors.defendant)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="notes"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Observações</FormLabel>
							<FormControl>
								<Textarea rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Salvando..." : "Salvar"}
				</Button>
			</form>
		</Form>
	);
};
