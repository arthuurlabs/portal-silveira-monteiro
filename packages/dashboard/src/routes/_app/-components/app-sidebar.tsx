import { Link, useMatchRoute } from "@tanstack/react-router";
import {
	CalendarDays,
	FolderIcon,
	Gavel,
	LayoutDashboard,
	Scale,
	UserCog,
	UserSearch,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";
import type { GetMeStatus200 } from "#/http/types/GetMe";

import { NavUser } from "./nav-user";

const NAV_ITEMS = [
	{
		title: "Painel",
		to: "/",
		icon: LayoutDashboard,
		adminOnly: false,
		tourId: "nav-painel",
	},
	{
		title: "Clientes",
		to: "/clients",
		icon: UserSearch,
		adminOnly: false,
		tourId: "nav-clientes",
	},
	{
		title: "Processos",
		to: "/processes",
		icon: Gavel,
		adminOnly: false,
		tourId: "nav-processos",
	},
	{
		title: "Tarefas",
		to: "/tasks",
		icon: FolderIcon,
		adminOnly: false,
		tourId: "nav-tarefas",
	},
	{
		title: "Calendário",
		to: "/calendar",
		icon: CalendarDays,
		adminOnly: false,
		tourId: "nav-calendario",
	},
	{
		title: "Usuários",
		to: "/users",
		icon: UserCog,
		adminOnly: true,
		tourId: "nav-usuarios",
	},
] as const;

type AppSidebarProps = {
	user: GetMeStatus200;
};

export const AppSidebar = ({ user }: AppSidebarProps) => {
	const matchRoute = useMatchRoute();

	return (
		<Sidebar collapsible="icon" className="border-dashed">
			<SidebarHeader className="gap-2 px-2 py-4">
				<Link to="/" className="flex items-center gap-3 rounded-md px-2 py-1">
					<span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
						<Scale className="size-4" aria-hidden="true" />
					</span>
					<span className="flex flex-col gap-0.5 overflow-hidden group-data-[collapsible=icon]:hidden">
						<span className="truncate font-display text-sm font-semibold leading-none text-sidebar-foreground">
							Silveira &amp; Monteiro
						</span>
						<span className="truncate text-[0.625rem] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/50">
							Sistema jurídico
						</span>
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAV_ITEMS.filter(
								(item) => !item.adminOnly || user.role === "ADMIN",
							).map((item) => {
								const isActive = Boolean(
									matchRoute({ to: item.to, fuzzy: false }),
								);

								return (
									<SidebarMenuItem key={item.to}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
										>
											<Link to={item.to} data-tour={item.tourId}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
};
