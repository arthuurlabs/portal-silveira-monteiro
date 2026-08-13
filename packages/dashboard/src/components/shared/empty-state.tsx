import type { LucideIcon } from "lucide-react";

import { cn } from "#/lib/utils";

type EmptyStateProps = {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
};

export const EmptyState = ({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-4 py-14 text-center",
				className,
			)}
		>
			{Icon ? (
				<span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<Icon className="size-5" aria-hidden="true" />
				</span>
			) : null}

			<div className="flex flex-col gap-1">
				<p className="text-sm font-medium text-foreground">{title}</p>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>

			{action ? <div className="mt-1">{action}</div> : null}
		</div>
	);
};
