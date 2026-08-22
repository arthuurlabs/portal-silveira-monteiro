import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide",
	{
		variants: {
			variant: {
				default: "border-primary/15 bg-primary/8 text-primary",
				neutral: "border-transparent bg-status-neutral-bg text-status-neutral-fg",
				success: "border-transparent bg-status-success-bg text-status-success-fg",
				warning: "border-transparent bg-status-warning-bg text-status-warning-fg",
				destructive: "border-transparent bg-status-danger-bg text-status-danger-fg",
				info: "border-transparent bg-status-info-bg text-status-info-fg",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

function Badge({
	className,
	variant,
	children,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		>
			<span aria-hidden="true" className="mr-1.5 size-1.5 shrink-0 rounded-full bg-current" />
			{children}
		</span>
	);
}

export { Badge, badgeVariants };
