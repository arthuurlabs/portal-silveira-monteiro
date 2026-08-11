import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { OFFICE_INFO } from "#/lib/office-info";
import { cn } from "#/lib/utils";

type DocumentFooterProps = {
	className?: string;
	/**
	 * Disponível para documentos longos (relatórios) exibirem "Página X de Y".
	 * O papel timbrado oficial não numera páginas, então nada é exibido por padrão.
	 */
	pageNumber?: number;
	pageCount?: number;
};

const Separator = () => <span className="text-paper-foreground/25">|</span>;

export const DocumentFooter = ({ className }: DocumentFooterProps) => (
	<div className={cn("flex shrink-0 flex-col justify-end gap-1.5", className)}>
		<div className="h-px w-full bg-ink/70" />

		<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[7pt] text-paper-foreground/70">
			<span className="inline-flex items-center gap-1">
				<GlobeIcon className="size-2.5 shrink-0" aria-hidden="true" />
				{OFFICE_INFO.website}
			</span>
			<Separator />
			<span className="inline-flex items-center gap-1">
				<MailIcon className="size-2.5 shrink-0" aria-hidden="true" />
				{OFFICE_INFO.email}
			</span>
			<Separator />
			<span className="inline-flex items-center gap-1">
				<PhoneIcon className="size-2.5 shrink-0" aria-hidden="true" />
				{OFFICE_INFO.phone}
			</span>
		</div>

		<div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[7pt] text-paper-foreground/70">
			<span className="inline-flex items-center gap-1">
				<MapPinIcon className="size-2.5 shrink-0" aria-hidden="true" />
				{OFFICE_INFO.address}
			</span>
			<Separator />
			<span>{OFFICE_INFO.oab}</span>
		</div>
	</div>
);
