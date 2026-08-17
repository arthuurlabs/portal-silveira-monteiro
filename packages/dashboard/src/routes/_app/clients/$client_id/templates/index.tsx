import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useListTemplates } from "#/http/hooks/useListTemplates";

const SKELETON_CARDS = ["card-1", "card-2", "card-3"];

const clientRoute = getRouteApi("/_app/clients/$client_id");

const ClientTemplatesRoute = () => {
	const { client } = clientRoute.useLoaderData();
	const { data, isPending, isError } = useListTemplates();

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<p className="sm-eyebrow">Modelos</p>
				<h1 className="sm-display text-3xl md:text-4xl">
					Modelos de documentos
				</h1>
				<div className="sm-rule" />
			</div>

			{isError ? (
				<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					Não foi possível carregar os modelos. Tente novamente.
				</p>
			) : isPending ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SKELETON_CARDS.map((card) => (
						<Skeleton key={card} className="h-28 w-full" />
					))}
				</div>
			) : data.data.length === 0 ? (
				<EmptyState icon={FileText} title="Nenhum modelo cadastrado ainda." />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.data.map((template) => (
						<Link
							key={template.id}
							to="/clients/$client_id/templates/$template_id"
							params={{ client_id: client.id, template_id: template.id }}
						>
							<Card className="h-full transition-colors hover:border-primary/40">
								<CardHeader>
									<CardTitle>{template.name}</CardTitle>
									<CardDescription>{template.description}</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/templates/")({
	component: ClientTemplatesRoute,
	head: () => ({ meta: [{ title: "Modelos | Silveira & Monteiro" }] }),
});
