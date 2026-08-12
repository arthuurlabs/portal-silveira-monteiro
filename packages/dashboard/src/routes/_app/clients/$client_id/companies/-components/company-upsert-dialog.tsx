import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { ListCompaniesStatus200 } from "#/http/types/ListCompanies";

import { CompanyForm } from "./company-form";

type CompanyListItem = ListCompaniesStatus200["data"][number];

type CompanyUpsertDialogProps = {
	clientId: string;
	company?: CompanyListItem;
	children: React.ReactNode;
};

export const CompanyUpsertDialog = ({
	clientId,
	company,
	children,
}: CompanyUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>
						{company ? "Editar empresa" : "Nova empresa"}
					</DialogTitle>
				</DialogHeader>
				<CompanyForm
					clientId={clientId}
					company={company}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
