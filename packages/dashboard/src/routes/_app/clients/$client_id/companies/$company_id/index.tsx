import { createFileRoute, getRouteApi } from "@tanstack/react-router";

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

const companyRoute = getRouteApi(
	"/_app/clients/$client_id/companies/$company_id",
);

const CompanyOverviewRoute = () => {
	const { company } = companyRoute.useLoaderData();

	return (
		<div className="grid gap-6 rounded-md border border-border p-6 sm:grid-cols-2 lg:grid-cols-3">
			<DetailField label="Razão social" value={company.razaoSocial} />
			<DetailField label="Nome fantasia" value={company.nomeFantasia} />
			<DetailField label="CNPJ" value={company.cnpj} />
			<DetailField label="Telefone" value={company.phone} />
			<DetailField label="E-mail" value={company.email} />
			<DetailField label="Endereço" value={company.address} />
		</div>
	);
};

export const Route = createFileRoute(
	"/_app/clients/$client_id/companies/$company_id/",
)({
	component: CompanyOverviewRoute,
	head: () => ({ meta: [{ title: "Empresa | Silveira & Monteiro" }] }),
});
