import type { A4Item } from "#/components/shared/a4-document";
import type { GetPublicPreviewStatus200 } from "#/http/types/GetPublicPreview";
import { formatDate } from "#/lib/format-date";

type PreviewIntake = GetPublicPreviewStatus200["intake"];
type PreviewClient = GetPublicPreviewStatus200["client"];

const PRACTICE_AREA_LABEL: Record<string, string> = {
	PREVIDENCIARIO: "Previdenciário",
	TRABALHISTA: "Trabalhista",
	CIVEL: "Cível",
	FAMILIA: "Família",
	CONSUMIDOR: "Consumidor",
	EMPRESARIAL: "Empresarial",
	CONTRATOS: "Contratos",
	OUTRO: "Outro",
};

const NEXT_STEP_LABEL: Record<string, string> = {
	SOLICITAR_DOCUMENTOS: "Solicitar documentos",
	ELABORAR_PARECER: "Elaborar parecer",
	AGENDAR_RETORNO: "Agendar retorno",
	ELABORAR_CONTRATO: "Elaborar contrato",
	PROTOCOLAR_ACAO: "Protocolar ação",
	TENTATIVA_ACORDO: "Tentativa de acordo",
	OUTRO: "Outro",
};

const REFERRAL_SOURCE_LABEL: Record<string, string> = {
	INDICACAO: "Indicação",
	INSTAGRAM: "Instagram",
	FACEBOOK: "Facebook",
	GOOGLE: "Google",
	SITE: "Site",
	OUTRO: "Outro",
};

const formatCurrency = (value: number) =>
	value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Título "➢ Seção", sublinhado — mesmo motivo do papel timbrado. */
const FichaSectionTitle = ({ title }: { title: string }) => (
	<h2 className="mb-2 flex items-center gap-1.5 font-document text-[11pt] font-bold underline">
		<span aria-hidden="true">➢</span>
		{title}
	</h2>
);

const FichaField = ({
	label,
	value,
}: {
	label: string;
	value: string | null;
}) => (
	<p>
		<span className="font-bold">{label}:</span> {value || "—"}
	</p>
);

const FichaCheckbox = ({
	checked,
	label,
}: {
	checked: boolean;
	label: string;
}) => (
	<span className="inline-flex items-center gap-1.5">
		<span
			aria-hidden="true"
			className="inline-flex size-3 shrink-0 items-center justify-center border border-current text-[8pt] leading-none"
		>
			{checked ? "✓" : ""}
		</span>
		{label}
	</span>
);

const FichaCheckboxGrid = ({
	options,
	selected,
}: {
	options: { value: string; label: string }[];
	selected: string[];
}) => (
	<div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
		{options.map((option) => (
			<FichaCheckbox
				key={option.value}
				checked={selected.includes(option.value)}
				label={option.label}
			/>
		))}
	</div>
);

/** Linha de assinatura em branco — preenchimento físico, nunca capturado pelo sistema. */
const FichaSignatureLine = ({
	label,
	dateLabel,
}: {
	label: string;
	dateLabel: string;
}) => (
	<div className="flex flex-col gap-4 pt-2">
		<div className="flex flex-col gap-1">
			<div className="h-px w-full max-w-[120mm] bg-paper-foreground/60" />
			<span className="text-[9pt] text-paper-foreground/70">{label}</span>
		</div>
		<p className="text-[9pt] text-paper-foreground/70">
			{dateLabel}: ____/____/______
		</p>
	</div>
);

type BuildIntakeRecordItemsParams = {
	intake: PreviewIntake;
	client: PreviewClient;
};

/**
 * Monta a ficha direto do atendimento + cliente — layout fixo, espelha a
 * "FICHA CADASTRAL" física do escritório.
 */
export const buildIntakeRecordItems = ({
	intake,
	client,
}: BuildIntakeRecordItemsParams): A4Item[] => {
	const practiceAreaOptions = Object.entries(PRACTICE_AREA_LABEL).map(
		([value, label]) => ({
			value,
			label,
		}),
	);
	const nextStepOptions = Object.entries(NEXT_STEP_LABEL).map(
		([value, label]) => ({
			value,
			label,
		}),
	);

	const hasFee = intake.feeAmount !== null || Boolean(intake.paymentMethod);
	const referralLabel = intake.referralSource
		? REFERRAL_SOURCE_LABEL[intake.referralSource]
		: null;

	return [
		{
			id: "client-data",
			node: (
				<div className="flex flex-col gap-1.5">
					<FichaSectionTitle title="Dados do cliente" />
					<FichaField label="Nome completo" value={client.fullName} />
					<FichaField label="CPF" value={client.cpf} />
					<FichaField label="RG" value={client.rg} />
					<FichaField
						label="Data de nascimento"
						value={formatDate(client.birthDate)}
					/>
					<FichaField label="Estado civil" value={client.maritalStatus} />
					<FichaField label="Profissão" value={client.profession} />
					<FichaField label="Telefone" value={client.phone} />
					<FichaField label="E-mail" value={client.email} />
					<FichaField label="Endereço completo" value={client.address} />
				</div>
			),
		},
		{
			id: "practice-area",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Área do atendimento" />
					<FichaCheckboxGrid
						options={practiceAreaOptions}
						selected={intake.practiceAreas}
					/>
					{intake.practiceAreaOther ? (
						<p>
							<span className="font-bold">Outro:</span>{" "}
							{intake.practiceAreaOther}
						</p>
					) : null}
				</div>
			),
		},
		{
			id: "client-report",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Relato do cliente" />
					<p className="text-justify">
						{intake.clientReport || "Não informado."}
					</p>
				</div>
			),
		},
		{
			id: "lawyer-analysis",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Análise preliminar do advogado" />
					<p className="text-justify">
						{intake.lawyerAnalysis || "Não informado."}
					</p>
				</div>
			),
			breakBefore: true,
		},
		{
			id: "next-steps",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Providências" />
					<FichaCheckboxGrid
						options={nextStepOptions}
						selected={intake.nextSteps}
					/>
					{intake.nextStepsOther ? (
						<p>
							<span className="font-bold">Outro:</span> {intake.nextStepsOther}
						</p>
					) : null}
				</div>
			),
		},
		{
			id: "initial-fee",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Honorários iniciais" />
					{hasFee ? (
						<>
							<FichaField
								label="Valor recebido"
								value={
									intake.feeAmount !== null
										? formatCurrency(intake.feeAmount)
										: null
								}
							/>
							<FichaField
								label="Forma de pagamento"
								value={intake.paymentMethod}
							/>
						</>
					) : (
						<p className="text-paper-foreground/70">Não informado.</p>
					)}
				</div>
			),
		},
		{
			id: "referral-source",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Como conheceu o escritório" />
					<p>{referralLabel ?? "Não informado."}</p>
					{intake.referralSource === "INDICACAO" && intake.referredByName ? (
						<FichaField label="Quem indicou" value={intake.referredByName} />
					) : null}
					{intake.referralSource === "OUTRO" && intake.referralSourceOther ? (
						<FichaField label="Detalhe" value={intake.referralSourceOther} />
					) : null}
				</div>
			),
		},
		{
			id: "responsible",
			node: (
				<div className="flex flex-col gap-2">
					<FichaSectionTitle title="Responsável pelo atendimento" />
					<FichaField label="Nome" value={intake.user.name} />
					<FichaField label="Data" value={formatDate(intake.createdAt)} />
					<FichaSignatureLine label="Assinatura" dateLabel="Data" />
				</div>
			),
		},
		{
			id: "lgpd-consent",
			node: (
				<div className="flex flex-col gap-3">
					<p className="text-justify text-[9pt]">
						Autorizo o tratamento dos meus dados pessoais para análise jurídica
						e eventual contratação de serviços advocatícios, nos termos da Lei
						nº 13.709/2018 (LGPD).
					</p>
					<div className="flex gap-6">
						<FichaCheckbox checked={intake.lgpdConsent} label="Concordo" />
						<FichaCheckbox checked={!intake.lgpdConsent} label="Discordo" />
					</div>
				</div>
			),
		},
		{
			id: "client-signature",
			node: (
				<FichaSignatureLine label="Assinatura do cliente" dateLabel="Data" />
			),
		},
	];
};

export const IntakeRecordTitle = () => (
	<h1 className="text-center font-document text-[12pt] font-bold uppercase">
		Ficha de atendimento – cliente
	</h1>
);
