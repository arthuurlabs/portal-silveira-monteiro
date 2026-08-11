import { createFileRoute } from "@tanstack/react-router";

const ClientTemplatesRoute = () => {
	return (
		<p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
			Em breve.
		</p>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/templates/")({
	component: ClientTemplatesRoute,
	head: () => ({ meta: [{ title: "Modelos | Silveira & Monteiro" }] }),
});
