import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useListCompanies } from "#/http/hooks/useListCompanies";

import { CompanyCardList } from "./companies/-components/company-card-list";
import { CompanyUpsertDialog } from "./companies/-components/company-upsert-dialog";

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

	const {
		data: companiesData,
		isPending: isCompaniesPending,
		isError: isCompaniesError,
	} = useListCompanies({ path: { clientId: client.id } });

	return (
		<div className="flex flex-col gap-6">
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

			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-4">
					<p className="sm-eyebrow">Empresas</p>
					<CompanyUpsertDialog clientId={client.id}>
						<Button>
							<Plus />
							Nova empresa
						</Button>
					</CompanyUpsertDialog>
				</div>

				<CompanyCardList
					clientId={client.id}
					companies={companiesData?.data}
					isPending={isCompaniesPending}
					isError={isCompaniesError}
				/>
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/")({
	component: ClientOverviewRoute,
	head: () => ({ meta: [{ title: "Cliente | Silveira & Monteiro" }] }),
});
