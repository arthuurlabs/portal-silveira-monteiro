import { Link } from "@tanstack/react-router";
import { CalendarDays, FolderIcon, UserSearch } from "lucide-react";

import { buttonVariants } from "#/components/ui/button";

const ACTIONS = [
	{ title: "Clientes", to: "/clients", icon: UserSearch },
	{ title: "Tarefas", to: "/tasks", icon: FolderIcon },
	{ title: "Calendário", to: "/calendar", icon: CalendarDays },
] as const;

export const DashboardQuickActions = () => {
	return (
		<div className="flex flex-wrap gap-2">
			{ACTIONS.map((action) => (
				<Link
					key={action.to}
					to={action.to}
					className={buttonVariants({ variant: "outline", size: "sm" })}
				>
					<action.icon />
					{action.title}
				</Link>
			))}
		</div>
	);
};
