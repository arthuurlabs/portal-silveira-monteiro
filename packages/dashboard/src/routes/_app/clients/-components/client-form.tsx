import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CnpjInput, CpfInput, PhoneInput, RgInput } from "#/components/shared/masked-input";
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
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group";
import { ResponseError } from "#/http/.kubb/client";
import { useCreateClient } from "#/http/hooks/useCreateClient";
import { getClientQueryOptions } from "#/http/hooks/useGetClient";
import { useUpdateClient } from "#/http/hooks/useUpdateClient";
import type { ListClientsStatus200 } from "#/http/types/ListClients";
import { getApiErrorMessage } from "#/lib/api-error";

type ClientListItem = ListClientsStatus200["data"][number];

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const clientFormSchema = z
	.object({
		personType: z.enum(["FISICA", "JURIDICA"]),
		fullName: z.string().trim(),
		cpf: z.string().trim(),
		rg: z.string().trim(),
		birthDate: z.string().trim(),
		maritalStatus: z.string().trim(),
		profession: z.string().trim(),
		razaoSocial: z.string().trim(),
		cnpj: z.string().trim(),
		nomeFantasia: z.string().trim(),
		phone: z.string().trim(),
		email: z.union([z.email("Informe um e-mail válido"), z.literal("")]),
		address: z.string().trim(),
	})
	.superRefine((values, ctx) => {
		if (values.personType === "FISICA") {
			if (!values.fullName) {
				ctx.addIssue({
					code: "custom",
					path: ["fullName"],
					message: "Informe o nome completo",
				});
			}
			if (onlyDigits(values.cpf).length !== 11) {
				ctx.addIssue({
					code: "custom",
					path: ["cpf"],
					message: "Informe um CPF válido",
				});
			}
			return;
		}

		if (!values.razaoSocial) {
			ctx.addIssue({
				code: "custom",
				path: ["razaoSocial"],
				message: "Informe a razão social",
			});
		}
		if (onlyDigits(values.cnpj).length !== 14) {
			ctx.addIssue({
				code: "custom",
				path: ["cnpj"],
				message: "Informe um CNPJ válido",
			});
		}
	});

type ClientFormInput = z.infer<typeof clientFormSchema>;

type ClientFormProps = {
	client?: ClientListItem;
	onSuccess: () => void;
};

const getDefaultValues = (client?: ClientListItem): ClientFormInput => ({
	personType: client?.personType ?? "FISICA",
	fullName: client?.fullName ?? "",
	cpf: client?.cpf ?? "",
	rg: client?.rg ?? "",
	birthDate: client?.birthDate ?? "",
	maritalStatus: client?.maritalStatus ?? "",
	profession: client?.profession ?? "",
	razaoSocial: client?.razaoSocial ?? "",
	cnpj: client?.cnpj ?? "",
	nomeFantasia: client?.nomeFantasia ?? "",
	phone: client?.phone ?? "",
	email: client?.email ?? "",
	address: client?.address ?? "",
});

export const ClientForm = ({ client, onSuccess }: ClientFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<ClientFormInput>({
		resolver: zodResolver(clientFormSchema),
		defaultValues: getDefaultValues(client),
	});

	const personType = form.watch("personType");

	const invalidateClients = () => {
		queryClient.invalidateQueries({ queryKey: [{ url: "/clients" }] });
	};

	const handleError = (error: unknown) => {
		const message = getApiErrorMessage(
			error,
			"Não foi possível salvar o cliente",
		);

		if (error instanceof ResponseError && error.status === 409) {
			form.setError(personType === "JURIDICA" ? "cnpj" : "cpf", { message });
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
		const body =
			values.personType === "JURIDICA"
				? {
						personType: "JURIDICA" as const,
						cnpj: values.cnpj,
						razaoSocial: values.razaoSocial,
						nomeFantasia: values.nomeFantasia || undefined,
						phone: values.phone || undefined,
						email: values.email || undefined,
						address: values.address || undefined,
					}
				: {
						personType: "FISICA" as const,
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
				<FormField
					control={form.control}
					name="personType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de pessoa</FormLabel>
							<FormControl>
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									disabled={Boolean(client)}
									className="grid grid-cols-2 gap-2"
								>
									<FormItem className="flex flex-row items-center gap-2 rounded-md border border-border px-3 py-2">
										<FormControl>
											<RadioGroupItem value="FISICA" id="personType-fisica" />
										</FormControl>
										<FormLabel
											htmlFor="personType-fisica"
											className="font-normal"
										>
											Pessoa física
										</FormLabel>
									</FormItem>
									<FormItem className="flex flex-row items-center gap-2 rounded-md border border-border px-3 py-2">
										<FormControl>
											<RadioGroupItem
												value="JURIDICA"
												id="personType-juridica"
											/>
										</FormControl>
										<FormLabel
											htmlFor="personType-juridica"
											className="font-normal"
										>
											Pessoa jurídica
										</FormLabel>
									</FormItem>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid gap-4 sm:grid-cols-2">
					{personType === "JURIDICA" ? (
						<>
							<FormField
								control={form.control}
								name="razaoSocial"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
										<FormLabel htmlFor="razaoSocial">Razão social</FormLabel>
										<FormControl>
											<Input
												id="razaoSocial"
												aria-invalid={Boolean(form.formState.errors.razaoSocial)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="cnpj"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="cnpj">CNPJ</FormLabel>
										<FormControl>
											<CnpjInput
												id="cnpj"
												value={field.value}
												onAccept={field.onChange}
												onBlur={field.onBlur}
												aria-invalid={Boolean(form.formState.errors.cnpj)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="nomeFantasia"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="nomeFantasia">Nome fantasia</FormLabel>
										<FormControl>
											<Input id="nomeFantasia" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					) : (
						<>
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
											<CpfInput
												id="cpf"
												value={field.value}
												onAccept={field.onChange}
												onBlur={field.onBlur}
												aria-invalid={Boolean(form.formState.errors.cpf)}
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
											<RgInput
												id="rg"
												value={field.value}
												onAccept={field.onChange}
												onBlur={field.onBlur}
											/>
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
						</>
					)}

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="phone">Telefone</FormLabel>
								<FormControl>
									<PhoneInput
										id="phone"
										value={field.value}
										onAccept={field.onChange}
										onBlur={field.onBlur}
										autoComplete="tel"
									/>
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
