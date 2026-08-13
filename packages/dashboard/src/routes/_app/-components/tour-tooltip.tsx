import { Scale, X } from "lucide-react";
import type { TooltipRenderProps } from "react-joyride";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export const TourTooltip = ({
	continuous,
	index,
	isLastStep,
	size,
	step,
	backProps,
	closeProps,
	primaryProps,
	skipProps,
	tooltipProps,
}: TooltipRenderProps) => {
	const isWelcome = step.placement === "center";

	return (
		<div
			{...tooltipProps}
			className={cn(
				"animate-in fade-in-0 zoom-in-95 rounded-xl border border-border bg-card text-card-foreground shadow-[var(--shadow-raised)]",
				isWelcome ? "w-96 p-6" : "w-80 p-5",
			)}
		>
			<div className="flex items-start justify-between gap-4">
				{isWelcome ? (
					<span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<Scale className="size-4" aria-hidden="true" />
					</span>
				) : (
					<p className="sm-eyebrow">
						Passo {index + 1} de {size}
					</p>
				)}

				<Button
					{...closeProps}
					type="button"
					variant="ghost"
					size="icon"
					className="-mt-1.5 -mr-1.5 size-7 shrink-0"
				>
					<X className="size-4" />
				</Button>
			</div>

			<div
				className={cn("flex flex-col gap-1.5", isWelcome ? "mt-4" : "mt-2.5")}
			>
				{step.title ? (
					<h2 className="font-display text-xl font-medium text-foreground">
						{step.title}
					</h2>
				) : null}
				<div className="sm-rule" />
			</div>

			<div className="mt-3 text-sm leading-relaxed text-muted-foreground">
				{step.content}
			</div>

			{continuous ? (
				<div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-[width] duration-300"
						style={{ width: `${((index + 1) / size) * 100}%` }}
					/>
				</div>
			) : null}

			<div className="mt-4 flex items-center justify-between gap-2">
				<button
					{...skipProps}
					type="button"
					className="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Pular
				</button>

				<div className="flex items-center gap-2">
					{continuous && index > 0 ? (
						<Button {...backProps} type="button" variant="outline" size="sm">
							Voltar
						</Button>
					) : null}
					<Button {...primaryProps} type="button" size="sm">
						{isLastStep ? "Concluir" : "Próximo"}
					</Button>
				</div>
			</div>
		</div>
	);
};
