import {
	createFileRoute,
	getRouteApi,
	Link,
	notFound,
} from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useMemo } from "react";

import { A4Document } from "#/components/shared/a4-document";
import { Button } from "#/components/ui/button";
import { ResponseError } from "#/http/.kubb/client";
import { getTemplateQueryOptions } from "#/http/hooks/useGetTemplate";

import { buildTemplateItems } from "./-components/build-template-items";

const clientRoute = getRouteApi("/_app/clients/$client_id");

const ClientTemplatePreviewRoute = () => {
	const { client } = clientRoute.useLoaderData();
	const { template } = Route.useLoaderData();
	const items = useMemo(
		() => buildTemplateItems(template, client),
		[template, client],
	);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4 print:hidden">
				<Link
					to="/clients/$client_id/templates"
					params={{ client_id: client.id }}
					className="text-sm text-muted-foreground hover:text-foreground"
				>
					← Voltar para modelos
				</Link>
				<Button variant="outline" size="sm" onClick={() => window.print()}>
					<Printer />
					Baixar
				</Button>
			</div>

			<div className="overflow-x-auto print:overflow-visible">
				<A4Document
					items={items}
					title={
						<h1 className="text-center font-document text-[12pt] font-bold uppercase">
							{template.title}
						</h1>
					}
				/>
			</div>
		</div>
	);
};

const TemplateNotFound = () => (
	<div className="flex flex-col items-center gap-3 py-16 text-center">
		<p className="text-lg font-medium text-foreground">Modelo não encontrado</p>
		<Link to="/clients" className="text-sm text-primary hover:underline">
			Voltar para clientes
		</Link>
	</div>
);

export const Route = createFileRoute(
	"/_app/clients/$client_id/templates/$template_id",
)({
	loader: async ({ context, params }) => {
		try {
			const template = await context.queryClient.ensureQueryData({
				...getTemplateQueryOptions({ path: { id: params.template_id } }),
				retry: false,
			});
			return { template };
		} catch (error) {
			if (error instanceof ResponseError && error.status === 404) {
				throw notFound();
			}
			throw error;
		}
	},
	component: ClientTemplatePreviewRoute,
	notFoundComponent: TemplateNotFound,
	head: () => ({ meta: [{ title: "Modelo | Silveira & Monteiro" }] }),
});
