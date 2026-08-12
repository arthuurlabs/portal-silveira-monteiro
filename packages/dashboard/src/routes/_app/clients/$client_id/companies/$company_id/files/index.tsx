import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useListDocuments } from "#/http/hooks/useListDocuments";

import { DocumentList } from "../../../-components/document-list";
import { DocumentUploadDialog } from "../../../-components/document-upload-dialog";

const CompanyFilesRoute = () => {
	const { client, company } = Route.useRouteContext();

	const { data, isPending, isError } = useListDocuments({
		path: { clientId: client.id },
		query: { companyId: company.id },
	});

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Arquivos</p>
					<h1 className="sm-display text-3xl md:text-4xl">Arquivos</h1>
					<div className="sm-rule" />
				</div>

				<DocumentUploadDialog clientId={client.id} companyId={company.id}>
					<Button>
						<Upload />
						Enviar documento
					</Button>
				</DocumentUploadDialog>
			</div>

			<DocumentList
				clientId={client.id}
				companyId={company.id}
				documents={data?.data}
				isPending={isPending}
				isError={isError}
			/>
		</div>
	);
};

export const Route = createFileRoute(
	"/_app/clients/$client_id/companies/$company_id/files/",
)({
	component: CompanyFilesRoute,
	head: () => ({
		meta: [{ title: "Arquivos da empresa | Silveira & Monteiro" }],
	}),
});
