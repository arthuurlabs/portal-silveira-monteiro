type TemplateSignatureLineProps = {
	label?: string;
};

export const TemplateSignatureLine = ({
	label,
}: TemplateSignatureLineProps) => (
	<div className="flex flex-col gap-1 pt-6">
		<div className="h-px w-full max-w-[120mm] bg-paper-foreground/60" />
		{label ? (
			<span className="text-[9pt] text-paper-foreground/70">{label}</span>
		) : null}
	</div>
);
