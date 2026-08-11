import { Skeleton } from "#/components/ui/skeleton";

export const AppShellSkeleton = () => {
	return (
		<output className="flex min-h-svh w-full" aria-label="Carregando aplicação">
			<div className="hidden w-64 shrink-0 flex-col gap-6 border-r border-dashed border-sidebar-border bg-sidebar p-4 md:flex">
				<div className="flex items-center gap-3">
					<Skeleton className="size-9 rounded-md bg-sidebar-accent" />
					<Skeleton className="h-4 w-32 bg-sidebar-accent" />
				</div>
				<div className="flex flex-col gap-2">
					<Skeleton className="h-8 w-full rounded-md bg-sidebar-accent" />
					<Skeleton className="h-8 w-full rounded-md bg-sidebar-accent" />
				</div>
				<div className="mt-auto flex items-center gap-3">
					<Skeleton className="size-8 rounded-md bg-sidebar-accent" />
					<Skeleton className="h-4 w-24 bg-sidebar-accent" />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="flex h-14 shrink-0 items-center border-b border-dashed border-border px-4">
					<Skeleton className="h-4 w-40" />
				</div>
				<div className="flex flex-1 flex-col gap-4 p-6">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-40 w-full" />
				</div>
			</div>
		</output>
	);
};
