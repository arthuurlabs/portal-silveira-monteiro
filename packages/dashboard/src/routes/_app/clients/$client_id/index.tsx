import { createFileRoute } from "@tanstack/react-router";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeZone: "UTC",
});

type DetailFieldProps = {
	label: string;
	value: string | null;
};

const DetailField = ({ label, value }: DetailFieldProps) => (
	<div className="flex flex-col gap-1">
		<p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
			{label}
		</p>
		<p className="text-sm text-foreground">{value ?? "—"}</p>
	</div>
);

const ClientOverviewRoute = () => {
	const { client } = Route.useRouteContext();

	return (
		<div className="grid gap-6 rounded-md border border-border p-6 sm:grid-cols-2 lg:grid-cols-3">
			<DetailField label="Nome completo" value={client.fullName} />
			<DetailField label="CPF" value={client.cpf} />
			<DetailField label="RG" value={client.rg} />
			<DetailField
				label="Data de nascimento"
				value={
					client.birthDate
						? dateFormatter.format(new Date(client.birthDate))
						: null
				}
			/>
			<DetailField label="Estado civil" value={client.maritalStatus} />
			<DetailField label="Profissão" value={client.profession} />
			<DetailField label="Telefone" value={client.phone} />
			<DetailField label="E-mail" value={client.email} />
			<DetailField label="Endereço" value={client.address} />
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/")({
	component: ClientOverviewRoute,
	head: () => ({ meta: [{ title: "Cliente | Silveira & Monteiro" }] }),
});
