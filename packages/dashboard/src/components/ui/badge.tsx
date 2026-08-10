import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide",
	{
		variants: {
			variant: {
				default: "border-primary/15 bg-primary/8 text-primary",
				neutral: "border-border bg-muted text-muted-foreground",
				success: "border-success/20 bg-success/10 text-success",
				warning: "border-warning/20 bg-warning/10 text-warning",
				destructive: "border-destructive/20 bg-destructive/10 text-destructive",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
