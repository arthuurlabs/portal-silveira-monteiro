import { createFileRoute } from "@tanstack/react-router";

import { useGetMe } from "#/http/hooks/useGetMe";

import { DashboardAgenda } from "./-components/dashboard-agenda";
import { DashboardQuickActions } from "./-components/dashboard-quick-actions";
import { DashboardStats } from "./-components/dashboard-stats";
import { DashboardTasks } from "./-components/dashboard-tasks";

const AppIndexRoute = () => {
	const { data: user } = useGetMe();
	const firstName = user?.name.split(" ")[0];

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col gap-3">
					<p className="sm-eyebrow">Painel</p>
					<h1 className="sm-display text-3xl md:text-4xl">
						Bem-vindo{firstName ? `, ${firstName}` : ""}.
					</h1>
					<div className="sm-rule" />
				</div>

				<DashboardQuickActions />
			</div>

			<DashboardStats />

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<DashboardAgenda />
				<DashboardTasks />
			</div>
		</div>
	);
};

export const Route = createFileRoute("/_app/")({
	component: AppIndexRoute,
	head: () => ({
		meta: [{ title: "Painel | Silveira & Monteiro" }],
	}),
});
