import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "#/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-[color,background-color,border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
				primary:
					"bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/70",
				outline:
					"border border-input bg-card text-foreground hover:border-primary/40 hover:bg-muted",
				ghost: "text-foreground hover:bg-muted",
				accent: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				link: "rounded-none px-0 text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 px-3 text-xs",
				default: "h-9 px-4",
				lg: "h-10 px-6",
				icon: "size-9",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

function Button({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
	return (
		<button
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
