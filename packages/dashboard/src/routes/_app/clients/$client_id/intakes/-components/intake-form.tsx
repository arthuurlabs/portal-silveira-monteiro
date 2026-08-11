import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
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
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { useCreateIntake } from "#/http/hooks/useCreateIntake";
import { useUpdateIntake } from "#/http/hooks/useUpdateIntake";
import type { ListIntakesStatus200 } from "#/http/types/ListIntakes";
import { getApiErrorMessage } from "#/lib/api-error";

type IntakeListItem = ListIntakesStatus200["data"][number];

export const PRACTICE_AREA_OPTIONS = [
	{ value: "PREVIDENCIARIO", label: "Previdenciário" },
	{ value: "TRABALHISTA", label: "Trabalhista" },
	{ value: "CIVEL", label: "Cível" },
	{ value: "FAMILIA", label: "Família" },
	{ value: "CONSUMIDOR", label: "Consumidor" },
	{ value: "EMPRESARIAL", label: "Empresarial" },
	{ value: "CONTRATOS", label: "Contratos" },
	{ value: "OUTRO", label: "Outro" },
] as const;

const NEXT_STEP_OPTIONS = [
	{ value: "SOLICITAR_DOCUMENTOS", label: "Solicitar documentos" },
	{ value: "ELABORAR_PARECER", label: "Elaborar parecer" },
	{ value: "AGENDAR_RETORNO", label: "Agendar retorno" },
	{ value: "ELABORAR_CONTRATO", label: "Elaborar contrato" },
	{ value: "PROTOCOLAR_ACAO", label: "Protocolar ação" },
	{ value: "TENTATIVA_ACORDO", label: "Tentativa de acordo" },
	{ value: "OUTRO", label: "Outro" },
] as const;

const REFERRAL_SOURCE_OPTIONS = [
	{ value: "INDICACAO", label: "Indicação" },
	{ value: "INSTAGRAM", label: "Instagram" },
	{ value: "FACEBOOK", label: "Facebook" },
	{ value: "GOOGLE", label: "Google" },
	{ value: "SITE", label: "Site" },
	{ value: "OUTRO", label: "Outro" },
] as const;

const intakeFormSchema = z.object({
	practiceAreas: z.array(z.string()),
	practiceAreaOther: z.string().trim(),
	clientReport: z.string().trim(),
	lawyerAnalysis: z.string().trim(),
	nextSteps: z.array(z.string()),
	nextStepsOther: z.string().trim(),
	feeAmount: z.string().trim(),
	paymentMethod: z.string().trim(),
	referralSource: z.string(),
	referredByName: z.string().trim(),
	referralSourceOther: z.string().trim(),
	lgpdConsent: z.boolean(),
});

type IntakeFormInput = z.infer<typeof intakeFormSchema>;

type IntakeFormProps = {
	clientId: string;
	intake?: IntakeListItem;
	onSuccess: () => void;
};

export const IntakeForm = ({
	clientId,
	intake,
	onSuccess,
}: IntakeFormProps) => {
	const queryClient = useQueryClient();

	const form = useForm<IntakeFormInput>({
		resolver: zodResolver(intakeFormSchema),
		defaultValues: {
			practiceAreas: intake?.practiceAreas ?? [],
			practiceAreaOther: intake?.practiceAreaOther ?? "",
			clientReport: intake?.clientReport ?? "",
			lawyerAnalysis: intake?.lawyerAnalysis ?? "",
			nextSteps: intake?.nextSteps ?? [],
			nextStepsOther: intake?.nextStepsOther ?? "",
			feeAmount: intake?.feeAmount != null ? String(intake.feeAmount) : "",
			paymentMethod: intake?.paymentMethod ?? "",
			referralSource: intake?.referralSource ?? "",
			referredByName: intake?.referredByName ?? "",
			referralSourceOther: intake?.referralSourceOther ?? "",
			lgpdConsent: intake?.lgpdConsent ?? false,
		},
	});

	const invalidateIntakes = () => {
		queryClient.invalidateQueries({
			queryKey: [{ url: "/clients/:clientId/intakes" }],
		});
	};

	const handleError = (error: unknown) => {
		toast.error(
			getApiErrorMessage(error, "Não foi possível salvar o atendimento"),
		);
	};

	const { mutate: createIntake, isPending: isCreating } = useCreateIntake({
		mutation: {
			onSuccess: () => {
				invalidateIntakes();
				toast.success("Atendimento criado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateIntake, isPending: isUpdating } = useUpdateIntake({
		mutation: {
			onSuccess: () => {
				invalidateIntakes();
				toast.success("Atendimento atualizado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const isPending = isCreating || isUpdating;
	const practiceAreas = form.watch("practiceAreas");
	const nextSteps = form.watch("nextSteps");
	const referralSource = form.watch("referralSource");

	const onSubmit = (values: IntakeFormInput) => {
		const body = {
			practiceAreas:
				values.practiceAreas as (typeof PRACTICE_AREA_OPTIONS)[number]["value"][],
			practiceAreaOther: values.practiceAreaOther || undefined,
			clientReport: values.clientReport || undefined,
			lawyerAnalysis: values.lawyerAnalysis || undefined,
			nextSteps:
				values.nextSteps as (typeof NEXT_STEP_OPTIONS)[number]["value"][],
			nextStepsOther: values.nextStepsOther || undefined,
			feeAmount: values.feeAmount ? Number(values.feeAmount) : undefined,
			paymentMethod: values.paymentMethod || undefined,
			referralSource: values.referralSource
				? (values.referralSource as (typeof REFERRAL_SOURCE_OPTIONS)[number]["value"])
				: undefined,
			referredByName: values.referredByName || undefined,
			referralSourceOther: values.referralSourceOther || undefined,
			lgpdConsent: values.lgpdConsent,
		};

		if (intake) {
			updateIntake({ path: { id: intake.id }, body });
			return;
		}

		createIntake({ path: { clientId }, body });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="practiceAreas"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Área do atendimento</FormLabel>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{PRACTICE_AREA_OPTIONS.map((option) => (
									<label
										key={option.value}
										htmlFor={`practiceArea-${option.value}`}
										className="flex items-center gap-2 text-sm text-foreground"
									>
										<Checkbox
											id={`practiceArea-${option.value}`}
											checked={field.value.includes(option.value)}
											onCheckedChange={(checked) => {
												field.onChange(
													checked
														? [...field.value, option.value]
														: field.value.filter(
																(value) => value !== option.value,
															),
												);
											}}
										/>
										{option.label}
									</label>
								))}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				{practiceAreas.includes("OUTRO") ? (
					<FormField
						control={form.control}
						name="practiceAreaOther"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="practiceAreaOther">
									Qual outra área?
								</FormLabel>
								<FormControl>
									<Input id="practiceAreaOther" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}

				<FormField
					control={form.control}
					name="clientReport"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="clientReport">Relato do cliente</FormLabel>
							<FormControl>
								<Textarea id="clientReport" rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="lawyerAnalysis"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="lawyerAnalysis">
								Análise preliminar do advogado
							</FormLabel>
							<FormControl>
								<Textarea id="lawyerAnalysis" rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="nextSteps"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Providências</FormLabel>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{NEXT_STEP_OPTIONS.map((option) => (
									<label
										key={option.value}
										htmlFor={`nextStep-${option.value}`}
										className="flex items-center gap-2 text-sm text-foreground"
									>
										<Checkbox
											id={`nextStep-${option.value}`}
											checked={field.value.includes(option.value)}
											onCheckedChange={(checked) => {
												field.onChange(
													checked
														? [...field.value, option.value]
														: field.value.filter(
																(value) => value !== option.value,
															),
												);
											}}
										/>
										{option.label}
									</label>
								))}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				{nextSteps.includes("OUTRO") ? (
					<FormField
						control={form.control}
						name="nextStepsOther"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="nextStepsOther">
									Qual outra providência?
								</FormLabel>
								<FormControl>
									<Input id="nextStepsOther" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}

				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						control={form.control}
						name="feeAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="feeAmount">Valor recebido (R$)</FormLabel>
								<FormControl>
									<Input
										id="feeAmount"
										type="number"
										step="0.01"
										min="0"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="paymentMethod"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="paymentMethod">
									Forma de pagamento
								</FormLabel>
								<FormControl>
									<Input id="paymentMethod" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="referralSource"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Como conheceu o escritório</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecione uma opção" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{REFERRAL_SOURCE_OPTIONS.map((option) => (
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

				{referralSource === "INDICACAO" ? (
					<FormField
						control={form.control}
						name="referredByName"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="referredByName">Quem indicou?</FormLabel>
								<FormControl>
									<Input id="referredByName" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}

				{referralSource === "OUTRO" ? (
					<FormField
						control={form.control}
						name="referralSourceOther"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="referralSourceOther">
									Qual outra origem?
								</FormLabel>
								<FormControl>
									<Input id="referralSourceOther" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : null}

				<FormField
					control={form.control}
					name="lgpdConsent"
					render={({ field }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-md border border-border px-3 py-2">
							<FormLabel htmlFor="lgpdConsent">
								Cliente concorda com o tratamento de dados (LGPD)
							</FormLabel>
							<FormControl>
								<Switch
									id="lgpdConsent"
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
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
