import type * as React from "react";

import { cn } from "#/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: The reusable label receives htmlFor from its consumer.
		<label
			data-slot="label"
			className={cn(
				"text-sm font-bold text-foreground peer-disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
