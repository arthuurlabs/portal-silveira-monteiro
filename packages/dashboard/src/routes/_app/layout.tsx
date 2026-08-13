import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { useGetMe } from "#/http/hooks/useGetMe";

import { AppHeader } from "./-components/app-header";
import { AppShellSkeleton } from "./-components/app-shell-skeleton";
import { AppSidebar } from "./-components/app-sidebar";
import { TourProvider } from "./-components/product-tour";

const AppLayout = () => {
	const { data: user, isPending } = useGetMe();

	if (isPending) {
		return <AppShellSkeleton />;
	}

	if (!user) {
		return <Navigate to="/sign-in" replace />;
	}

	return (
		<TourProvider user={user}>
			<SidebarProvider>
				<AppSidebar user={user} />
				<SidebarInset>
					<AppHeader />
					<div className="flex flex-1 flex-col gap-6 p-6 print:gap-0 print:p-0">
						<Outlet />
					</div>
				</SidebarInset>
			</SidebarProvider>
		</TourProvider>
	);
};

export const Route = createFileRoute("/_app")({
	component: AppLayout,
});
