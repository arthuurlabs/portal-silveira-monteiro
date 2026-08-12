import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import type { ListCompaniesStatus200 } from "#/http/types/ListCompanies";

import { CompanyActionsMenu } from "./company-actions-menu";

type CompanyListItem = ListCompaniesStatus200["data"][number];

type CompanyCardProps = {
	clientId: string;
	company: CompanyListItem;
};

export const CompanyCard = ({ clientId, company }: CompanyCardProps) => {
	return (
		<div className="relative rounded-md border border-border p-4 transition-colors hover:border-foreground/30">
			<Link
				to="/clients/$client_id/companies/$company_id"
				params={{ client_id: clientId, company_id: company.id }}
				className="flex flex-col gap-3"
			>
				<div className="flex flex-col gap-1 pr-8">
					<span className="font-medium text-foreground">
						{company.razaoSocial}
					</span>
					{company.nomeFantasia ? (
						<span className="text-sm text-muted-foreground">
							{company.nomeFantasia}
						</span>
					) : null}
				</div>

				<div className="flex items-center justify-between gap-2">
					<span className="text-sm text-muted-foreground">{company.cnpj}</span>
					<Badge variant={company.isActive ? "success" : "neutral"}>
						{company.isActive ? "Ativa" : "Inativa"}
					</Badge>
				</div>
			</Link>

			<div className="absolute top-3 right-3">
				<CompanyActionsMenu clientId={clientId} company={company} />
			</div>
		</div>
	);
};
