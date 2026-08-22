import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils";

const alertVariants = cva(
	"grid grid-cols-[20px_1fr] items-start gap-3 rounded-md border border-border border-l-[3px] bg-card p-3.5 text-sm [&>svg]:mt-0.5 [&>svg]:size-4",
	{
		variants: {
			variant: {
				info: "border-l-info [&>svg]:text-info",
				warning: "border-l-warning [&>svg]:text-warning",
				danger: "border-l-destructive [&>svg]:text-destructive",
				success: "border-l-success [&>svg]:text-success",
			},
		},
		defaultVariants: { variant: "info" },
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="alert-title"
			className={cn("font-semibold text-foreground", className)}
			{...props}
		/>
	);
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="alert-description"
			className={cn("text-muted-foreground", className)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription };
