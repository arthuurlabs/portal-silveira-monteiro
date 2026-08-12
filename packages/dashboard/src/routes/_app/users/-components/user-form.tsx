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
import { useCreateUser } from "#/http/hooks/useCreateUser";
import { getApiErrorMessage } from "#/lib/api-error";

const ROLE_OPTIONS = [
	{ value: "MEMBER", label: "Membro" },
	{ value: "ADMIN", label: "Administrador" },
] as const;

const userFormSchema = z.object({
	name: z.string().trim().min(1, "Informe o nome"),
	email: z.email("Informe um e-mail válido"),
	role: z.enum(["ADMIN", "MEMBER"]),
});

type UserFormInput = z.infer<typeof userFormSchema>;

type UserFormProps = {
	onSuccess: () => void;
};

export const UserForm = ({ onSuccess }: UserFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<UserFormInput>({
		resolver: zodResolver(userFormSchema),
		defaultValues: { name: "", email: "", role: "MEMBER" },
	});

	const { mutate, isPending } = useCreateUser({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: [{ url: "/users" }] });
				toast.success("Usuário criado — um e-mail de ativação foi enviado");
				onSuccess();
			},
			onError: (error) => {
				const message = getApiErrorMessage(
					error,
					"Não foi possível criar o usuário",
				);

				toast.error(message);
			},
		},
	});

	const onSubmit = (values: UserFormInput) => {
		mutate({ body: values });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nome</FormLabel>
							<FormControl>
								<Input
									aria-invalid={Boolean(form.formState.errors.name)}
									{...field}
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
					name="role"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Papel</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecione o papel" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{ROLE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isPending} className="mt-2">
					{isPending ? "Criando..." : "Criar usuário"}
				</Button>
			</form>
		</Form>
	);
};
