import { createFileRoute } from "@tanstack/react-router";

import { useGetMe } from "#/http/hooks/useGetMe";

const AppIndexRoute = () => {
	const { data: user } = useGetMe();
	const firstName = user?.name.split(" ")[0];

	return (
		<div className="flex flex-col gap-3">
			<p className="sm-eyebrow">Painel</p>
			<h1 className="sm-display text-3xl md:text-4xl">
				Bem-vindo{firstName ? `, ${firstName}` : ""}.
			</h1>
			<div className="sm-rule" />
		</div>
	);
};

export const Route = createFileRoute("/_app/")({
	component: AppIndexRoute,
	head: () => ({
		meta: [{ title: "Painel | Silveira & Monteiro" }],
	}),
});
