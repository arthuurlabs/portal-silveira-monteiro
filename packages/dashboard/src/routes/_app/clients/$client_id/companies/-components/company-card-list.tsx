import { Building2 } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Skeleton } from "#/components/ui/skeleton";
import type { ListCompaniesStatus200 } from "#/http/types/ListCompanies";

import { CompanyCard } from "./company-card";

type CompanyListItem = ListCompaniesStatus200["data"][number];

type CompanyCardListProps = {
	clientId: string;
	companies: CompanyListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_CARDS = ["card-1", "card-2", "card-3"];

export const CompanyCardList = ({
	clientId,
	companies,
	isPending,
	isError,
}: CompanyCardListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar as empresas. Tente novamente.
			</p>
		);
	}

	if (isPending) {
		return (
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{SKELETON_CARDS.map((card) => (
					<Skeleton key={card} className="h-28 w-full" />
				))}
			</div>
		);
	}

	if (!companies || companies.length === 0) {
		return (
			<EmptyState icon={Building2} title="Nenhuma empresa cadastrada ainda." />
		);
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{companies.map((company) => (
				<CompanyCard key={company.id} clientId={clientId} company={company} />
			))}
		</div>
	);
};
