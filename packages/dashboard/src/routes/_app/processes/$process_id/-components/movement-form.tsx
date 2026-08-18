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
import { Textarea } from "#/components/ui/textarea";
import { useCreateProcessMovement } from "#/http/hooks/useCreateProcessMovement";
import { listProcessMovementsQueryKey } from "#/http/hooks/useListProcessMovements";
import { getApiErrorMessage } from "#/lib/api-error";

const movementFormSchema = z.object({
	occurredAt: z.string().trim().min(1, "Informe a data"),
	description: z.string().trim().min(1, "Informe a descrição"),
});

type MovementFormInput = z.infer<typeof movementFormSchema>;

type MovementFormProps = {
	processId: string;
	onSuccess: () => void;
};

export const MovementForm = ({ processId, onSuccess }: MovementFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<MovementFormInput>({
		resolver: zodResolver(movementFormSchema),
		defaultValues: { occurredAt: "", description: "" },
	});

	const { mutate, isPending } = useCreateProcessMovement({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: listProcessMovementsQueryKey({ path: { processId } }),
				});
				toast.success("Movimentação registrada com sucesso");
				onSuccess();
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(
						error,
						"Não foi possível registrar a movimentação",
					),
				);
			},
		},
	});

	const onSubmit = (values: MovementFormInput) => {
		mutate({ path: { processId }, body: values });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="occurredAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Data</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição</FormLabel>
							<FormControl>
								<Textarea rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Salvando..." : "Registrar movimentação"}
				</Button>
			</form>
		</Form>
	);
};
