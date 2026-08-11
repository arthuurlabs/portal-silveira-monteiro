import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "#/components/ui/sidebar";
import { useSignOut } from "#/http/hooks/useSignOut";
import type { GetMeStatus200 } from "#/http/types/GetMe";
import { getApiErrorMessage } from "#/lib/api-error";

const ROLE_LABELS: Record<GetMeStatus200["role"], string> = {
	ADMIN: "Administrador",
	MEMBER: "Membro",
};

const getInitials = (name: string) => {
	const [first, second] = name.trim().split(/\s+/);
	return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase() || "US";
};

type NavUserProps = {
	user: GetMeStatus200;
};

export const NavUser = ({ user }: NavUserProps) => {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();

	const { mutate, isPending } = useSignOut({
		mutation: {
			onSuccess: () => {
				navigate({ to: "/sign-in", replace: true });
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível sair. Tente novamente."),
				);
			},
		},
	});

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar size="sm" className="rounded-md">
								<AvatarFallback className="rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
									{getInitials(user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left leading-tight">
								<span className="truncate text-sm font-medium">
									{user.name}
								</span>
								<span className="truncate text-[0.6875rem] text-sidebar-foreground/60">
									{ROLE_LABELS[user.role]}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-64"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col gap-0.5">
								<span className="truncate text-sm font-medium text-foreground">
									{user.name}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							disabled={isPending}
							onSelect={(event) => {
								event.preventDefault();
								mutate(undefined);
							}}
						>
							<LogOut />
							{isPending ? "Saindo..." : "Sair"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
