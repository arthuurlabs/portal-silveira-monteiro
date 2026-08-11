import { type ReactNode, useRef, useState } from "react";

import { useIsomorphicLayoutEffect } from "#/hooks/use-isomorphic-layout-effect";
import { cn } from "#/lib/utils";

import { DocumentFooter } from "./document-footer";
import { DocumentLetterhead } from "./document-letterhead";

/**
 * Geometria da folha A4. Fonte única da verdade: as classes de layout abaixo e
 * o orçamento de altura usado na paginação derivam destes mesmos números.
 */
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PADDING_X_MM = 22;
const PADDING_TOP_MM = 14;
const PADDING_BOTTOM_MM = 10;
const LETTERHEAD_MM = 26;
const FOOTER_MM = 18;
/** Respiro entre o timbre e o início do conteúdo (`pt-[6mm]` da área de conteúdo). */
const CONTENT_TOP_GAP_MM = 6;

const CONTENT_HEIGHT_MM =
	PAGE_HEIGHT_MM -
	PADDING_TOP_MM -
	PADDING_BOTTOM_MM -
	LETTERHEAD_MM -
	FOOTER_MM -
	CONTENT_TOP_GAP_MM;

/** `offsetHeight` devolve px de CSS — a conversão do spec é exata e imune a zoom. */
const mmToPx = (mm: number) => (mm * 96) / 25.4;

/** Espaçamento entre blocos. É `padding` (e não `margin`) de propósito: entra no `offsetHeight`. */
const ITEM_SPACING = "pb-[4mm]";
const TITLE_SPACING = "pb-[6mm]";

export type A4Item = {
	id: string;
	node: ReactNode;
	/** Força o bloco a começar numa página nova. */
	breakBefore?: boolean;
};

type A4DocumentProps = {
	items: A4Item[];
	/** Renderizado apenas na primeira página, abaixo do timbre. */
	title?: ReactNode;
	className?: string;
};

const Sheet = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div
		data-slot="document-sheet"
		className={cn(
			"flex w-[210mm] shrink-0 flex-col border border-border bg-paper text-paper-foreground shadow-lg",
			"px-[22mm] pt-[14mm] pb-[10mm]",
			"font-document text-[11pt] leading-relaxed",
			"print:border-0 print:shadow-none",
			className,
		)}
		style={{ width: `${PAGE_WIDTH_MM}mm` }}
	>
		{children}
	</div>
);

export const A4Document = ({ items, title, className }: A4DocumentProps) => {
	const [pages, setPages] = useState<A4Item[][] | null>(null);
	const [isMeasuring, setIsMeasuring] = useState(false);
	const measureRef = useRef<HTMLDivElement>(null);

	// `items` pode chegar sem memoização do consumidor; a chave estável evita
	// que o efeito re-dispare a cada render do pai.
	const itemsKey = items
		.map((item) => `${item.id}:${item.breakBefore ? 1 : 0}`)
		.join("|");
	const itemsRef = useRef(items);
	itemsRef.current = items;

	// Só habilita a medição no cliente: no servidor não há layout para medir, e
	// manter o container fora do HTML de SSR evita duplicar o conteúdo.
	useIsomorphicLayoutEffect(() => {
		setIsMeasuring(true);
	}, []);

	useIsomorphicLayoutEffect(() => {
		if (!isMeasuring) {
			return;
		}

		const container = measureRef.current;

		if (!container) {
			return;
		}

		let cancelled = false;

		const measure = () => {
			if (cancelled) {
				return;
			}

			const budget = mmToPx(CONTENT_HEIGHT_MM);
			const titleElement = container.querySelector<HTMLElement>(
				'[data-measure="title"]',
			);
			const itemElements = container.querySelectorAll<HTMLElement>(
				'[data-measure="item"]',
			);

			const result: A4Item[][] = [];
			let current: A4Item[] = [];
			let used = titleElement?.offsetHeight ?? 0;

			itemsRef.current.forEach((item, index) => {
				const height = itemElements[index]?.offsetHeight ?? 0;
				const overflows = used + height > budget;

				if (current.length > 0 && (item.breakBefore || overflows)) {
					result.push(current);
					current = [];
					used = 0;
				}

				current.push(item);
				used += height;
			});

			if (current.length > 0) {
				result.push(current);
			}

			setPages(result.length > 0 ? result : [[]]);
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(container);

		// A troca da fonte de fallback pela definitiva muda as alturas.
		void document.fonts?.ready.then(measure);

		return () => {
			cancelled = true;
			observer.disconnect();
		};
	}, [itemsKey, isMeasuring]);

	const renderItem = (item: A4Item) => (
		<div key={item.id} className={ITEM_SPACING}>
			{item.node}
		</div>
	);

	return (
		<div
			className={cn("flex flex-col items-center gap-6 print:gap-0", className)}
		>
			{isMeasuring ? (
				<div
					ref={measureRef}
					aria-hidden="true"
					className="pointer-events-none invisible absolute top-0 left-0 font-document text-[11pt] leading-relaxed"
					style={{ width: `${PAGE_WIDTH_MM - PADDING_X_MM * 2}mm` }}
				>
					{title ? (
						<div data-measure="title" className={TITLE_SPACING}>
							{title}
						</div>
					) : null}
					{items.map((item) => (
						<div key={item.id} data-measure="item" className={ITEM_SPACING}>
							{item.node}
						</div>
					))}
				</div>
			) : null}

			{pages === null ? (
				// SSR e primeiro paint: folha contínua, sem divisão. Conteúdo
				// completo e legível; a paginação real entra após a hidratação.
				<Sheet className="min-h-[297mm]">
					<DocumentLetterhead className="h-[26mm]" />
					<div className="flex-1 pt-[6mm]">
						{title ? <div className={TITLE_SPACING}>{title}</div> : null}
						{items.map(renderItem)}
					</div>
					<DocumentFooter className="h-[18mm]" />
				</Sheet>
			) : (
				pages.map((pageItems, pageIndex) => (
					<Sheet
						// biome-ignore lint/suspicious/noArrayIndexKey: páginas são recalculadas como um todo a cada medição, não reordenadas
						key={pageIndex}
						className="h-[297mm] print:not-last:break-after-page"
					>
						<DocumentLetterhead className="h-[26mm]" />
						<div
							data-slot="document-content"
							className="flex-1 overflow-hidden pt-[6mm]"
						>
							{pageIndex === 0 && title ? (
								<div className={TITLE_SPACING}>{title}</div>
							) : null}
							{pageItems.map(renderItem)}
						</div>
						<DocumentFooter
							className="h-[18mm]"
							pageNumber={pageIndex + 1}
							pageCount={pages.length}
						/>
					</Sheet>
				))
			)}
		</div>
	);
};
