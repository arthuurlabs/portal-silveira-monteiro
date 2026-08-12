import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { useListCompanies } from "#/http/hooks/useListCompanies";

type CompanySwitcherProps = {
	clientId: string;
	currentCompanyId: string;
};

export const CompanySwitcher = ({
	clientId,
	currentCompanyId,
}: CompanySwitcherProps) => {
	const navigate = useNavigate();

	const { data } = useListCompanies({ path: { clientId } });
	const companies = data?.data ?? [];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					Trocar de empresa
					<ChevronsUpDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel>Empresas deste cliente</DropdownMenuLabel>
				{companies.map((company) => (
					<DropdownMenuItem
						key={company.id}
						onSelect={() =>
							navigate({
								to: "/clients/$client_id/companies/$company_id",
								params: { client_id: clientId, company_id: company.id },
							})
						}
					>
						{company.id === currentCompanyId ? (
							<Check />
						) : (
							<span className="size-4" />
						)}
						{company.razaoSocial}
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link to="/clients/$client_id" params={{ client_id: clientId }}>
						Voltar para o cliente
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
