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
import { Switch } from "#/components/ui/switch";
import { ResponseError } from "#/http/.kubb/client";
import { useCreateCompany } from "#/http/hooks/useCreateCompany";
import { getCompanyQueryKey } from "#/http/hooks/useGetCompany";
import { useUpdateCompany } from "#/http/hooks/useUpdateCompany";
import type { ListCompaniesStatus200 } from "#/http/types/ListCompanies";
import { getApiErrorMessage } from "#/lib/api-error";

type CompanyListItem = ListCompaniesStatus200["data"][number];

const companyFormSchema = z.object({
	cnpj: z.string().trim().min(14, "Informe um CNPJ válido"),
	razaoSocial: z.string().trim().min(1, "Informe a razão social"),
	nomeFantasia: z.string().trim(),
	phone: z.string().trim(),
	email: z.union([z.email("Informe um e-mail válido"), z.literal("")]),
	address: z.string().trim(),
	isActive: z.boolean(),
});

type CompanyFormInput = z.infer<typeof companyFormSchema>;

type CompanyFormProps = {
	clientId: string;
	company?: CompanyListItem;
	onSuccess: () => void;
};

export const CompanyForm = ({
	clientId,
	company,
	onSuccess,
}: CompanyFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<CompanyFormInput>({
		resolver: zodResolver(companyFormSchema),
		defaultValues: {
			cnpj: company?.cnpj ?? "",
			razaoSocial: company?.razaoSocial ?? "",
			nomeFantasia: company?.nomeFantasia ?? "",
			phone: company?.phone ?? "",
			email: company?.email ?? "",
			address: company?.address ?? "",
			isActive: company?.isActive ?? true,
		},
	});

	const invalidateCompanies = () => {
		queryClient.invalidateQueries({
			queryKey: [{ url: "/clients/:clientId/companies" }],
		});
	};

	const handleError = (error: unknown) => {
		const message = getApiErrorMessage(
			error,
			"Não foi possível salvar a empresa",
		);

		if (error instanceof ResponseError && error.status === 409) {
			form.setError("cnpj", { message });
			return;
		}

		toast.error(message);
	};

	const { mutate: createCompany, isPending: isCreating } = useCreateCompany({
		mutation: {
			onSuccess: () => {
				invalidateCompanies();
				toast.success("Empresa criada com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany({
		mutation: {
			onSuccess: (_data, variables) => {
				invalidateCompanies();
				queryClient.invalidateQueries({
					queryKey: getCompanyQueryKey({ path: { id: variables.path.id } }),
				});
				toast.success("Empresa atualizada com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const isPending = isCreating || isUpdating;

	const onSubmit = (values: CompanyFormInput) => {
		const body = {
			cnpj: values.cnpj,
			razaoSocial: values.razaoSocial,
			nomeFantasia: values.nomeFantasia || undefined,
			phone: values.phone || undefined,
			email: values.email || undefined,
			address: values.address || undefined,
			isActive: company ? values.isActive : undefined,
		};

		if (company) {
			updateCompany({ path: { id: company.id }, body });
			return;
		}

		createCompany({ path: { clientId }, body });
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
						name="razaoSocial"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
								<FormLabel>Razão social</FormLabel>
								<FormControl>
									<Input
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
								<FormLabel>CNPJ</FormLabel>
								<FormControl>
									<Input
										aria-invalid={Boolean(form.formState.errors.cnpj)}
										{...field}
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
								<FormLabel>Nome fantasia</FormLabel>
								<FormControl>
									<Input {...field} />
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
								<FormLabel>Telefone</FormLabel>
								<FormControl>
									<Input autoComplete="tel" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>E-mail</FormLabel>
								<FormControl>
									<Input
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
								<FormLabel>Endereço</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{company ? (
					<FormField
						control={form.control}
						name="isActive"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-md border border-border px-3 py-2">
								<FormLabel>Empresa ativa</FormLabel>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				) : null}

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Salvando..." : "Salvar"}
				</Button>
			</form>
		</Form>
	);
};
