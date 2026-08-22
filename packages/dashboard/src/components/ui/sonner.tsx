import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
	return (
		<Sonner
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--success-bg": "var(--status-success-bg)",
					"--success-text": "var(--status-success-fg)",
					"--success-border": "var(--status-success-bg)",
					"--warning-bg": "var(--status-warning-bg)",
					"--warning-text": "var(--status-warning-fg)",
					"--warning-border": "var(--status-warning-bg)",
					"--error-bg": "var(--status-danger-bg)",
					"--error-text": "var(--status-danger-fg)",
					"--error-border": "var(--status-danger-bg)",
					"--info-bg": "var(--status-info-bg)",
					"--info-text": "var(--status-info-fg)",
					"--info-border": "var(--status-info-bg)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
}

export { Toaster };
