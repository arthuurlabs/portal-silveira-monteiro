import { Separator } from "#/components/ui/separator";
import { SidebarTrigger } from "#/components/ui/sidebar";

export const AppHeader = () => {
	return (
		<header className="flex h-14 shrink-0 items-center gap-3 border-b border-dashed border-border px-4">
			<SidebarTrigger />
			<Separator orientation="vertical" className="h-4" />
			<p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
				Via retida · uso interno
			</p>
		</header>
	);
};
