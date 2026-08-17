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
import { ResponseError } from "#/http/.kubb/client";
import { useCreateClient } from "#/http/hooks/useCreateClient";
import { getClientQueryOptions } from "#/http/hooks/useGetClient";
import { useUpdateClient } from "#/http/hooks/useUpdateClient";
import type { ListClientsStatus200 } from "#/http/types/ListClients";
import { getApiErrorMessage } from "#/lib/api-error";

type ClientListItem = ListClientsStatus200["data"][number];

const clientFormSchema = z.object({
	fullName: z.string().trim().min(1, "Informe o nome completo"),
	cpf: z.string().trim().min(11, "Informe um CPF válido"),
	rg: z.string().trim(),
	birthDate: z.string().trim(),
	maritalStatus: z.string().trim(),
	profession: z.string().trim(),
	phone: z.string().trim(),
	email: z.union([z.email("Informe um e-mail válido"), z.literal("")]),
	address: z.string().trim(),
});

type ClientFormInput = z.infer<typeof clientFormSchema>;

type ClientFormProps = {
	client?: ClientListItem;
	onSuccess: () => void;
};

export const ClientForm = ({ client, onSuccess }: ClientFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<ClientFormInput>({
		resolver: zodResolver(clientFormSchema),
		defaultValues: {
			fullName: client?.fullName ?? "",
			cpf: client?.cpf ?? "",
			rg: client?.rg ?? "",
			birthDate: client?.birthDate ?? "",
			maritalStatus: client?.maritalStatus ?? "",
			profession: client?.profession ?? "",
			phone: client?.phone ?? "",
			email: client?.email ?? "",
			address: client?.address ?? "",
		},
	});

	const invalidateClients = () => {
		queryClient.invalidateQueries({ queryKey: [{ url: "/clients" }] });
	};

	const handleError = (error: unknown) => {
		const message = getApiErrorMessage(
			error,
			"Não foi possível salvar o cliente",
		);

		if (error instanceof ResponseError && error.status === 409) {
			form.setError("cpf", { message });
			return;
		}

		toast.error(message);
	};

	const { mutate: createClient, isPending: isCreating } = useCreateClient({
		mutation: {
			onSuccess: () => {
				invalidateClients();
				toast.success("Cliente criado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateClient, isPending: isUpdating } = useUpdateClient({
		mutation: {
			onSuccess: () => {
				invalidateClients();

				if (client) {
					queryClient.invalidateQueries({
						queryKey: getClientQueryOptions({ path: { id: client.id } })
							.queryKey,
					});
				}

				toast.success("Cliente atualizado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const isPending = isCreating || isUpdating;

	const onSubmit = (values: ClientFormInput) => {
		const body = {
			fullName: values.fullName,
			cpf: values.cpf,
			rg: values.rg || undefined,
			birthDate: values.birthDate || undefined,
			maritalStatus: values.maritalStatus || undefined,
			profession: values.profession || undefined,
			phone: values.phone || undefined,
			email: values.email || undefined,
			address: values.address || undefined,
		};

		if (client) {
			updateClient({ path: { id: client.id }, body });
			return;
		}

		createClient({ body });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="fullName"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel htmlFor="fullName">Nome completo</FormLabel>
								<FormControl>
									<Input
										id="fullName"
										aria-invalid={Boolean(form.formState.errors.fullName)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cpf"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="cpf">CPF</FormLabel>
								<FormControl>
									<Input
										id="cpf"
										aria-invalid={Boolean(form.formState.errors.cpf)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="rg"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="rg">RG</FormLabel>
								<FormControl>
									<Input id="rg" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="birthDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="birthDate">Data de nascimento</FormLabel>
								<FormControl>
									<Input id="birthDate" type="date" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="maritalStatus"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="maritalStatus">Estado civil</FormLabel>
								<FormControl>
									<Input id="maritalStatus" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="profession"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="profession">Profissão</FormLabel>
								<FormControl>
									<Input id="profession" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="phone">Telefone</FormLabel>
								<FormControl>
									<Input id="phone" autoComplete="tel" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem className="col-span-full">
								<FormLabel htmlFor="email">E-mail</FormLabel>
								<FormControl>
									<Input
										id="email"
										type="email"
										autoComplete="email"
										aria-invalid={Boolean(form.formState.errors.email)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="address"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel htmlFor="address">Endereço</FormLabel>
								<FormControl>
									<Input id="address" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Salvando..." : "Salvar"}
				</Button>
			</form>
		</Form>
	);
};
