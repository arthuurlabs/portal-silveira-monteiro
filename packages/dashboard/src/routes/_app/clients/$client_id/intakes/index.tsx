import { createFileRoute } from "@tanstack/react-router";

const ClientIntakesRoute = () => {
	return (
		<p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
			Em breve.
		</p>
	);
};

export const Route = createFileRoute("/_app/clients/$client_id/intakes/")({
	component: ClientIntakesRoute,
	head: () => ({ meta: [{ title: "Atendimentos | Silveira & Monteiro" }] }),
});
