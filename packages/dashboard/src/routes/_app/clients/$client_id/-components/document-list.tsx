import { FolderOpen } from "lucide-react";

import { Skeleton } from "#/components/ui/skeleton";
import type { ListDocumentsStatus200 } from "#/http/types/ListDocuments";

import { DocumentCard } from "./document-card";

type DocumentListItem = ListDocumentsStatus200["data"][number];

type DocumentListProps = {
	clientId: string;
	companyId?: string;
	documents: DocumentListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_TILES = ["tile-1", "tile-2", "tile-3", "tile-4", "tile-5"];

const GRID_CLASSES =
	"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export const DocumentList = ({
	clientId,
	companyId,
	documents,
	isPending,
	isError,
}: DocumentListProps) => {
	if (isError) {
		return (
			<p className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
				Não foi possível carregar os documentos. Tente novamente.
			</p>
		);
	}

	if (isPending) {
		return (
			<div className={GRID_CLASSES}>
				{SKELETON_TILES.map((tile) => (
					<Skeleton key={tile} className="aspect-square rounded-xl" />
				))}
			</div>
		);
	}

	if (!documents || documents.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border px-4 py-14 text-center">
				<FolderOpen className="size-8 text-muted-foreground/60" />
				<p className="text-sm text-muted-foreground">
					Nenhum documento enviado ainda.
				</p>
			</div>
		);
	}

	return (
		<div className={GRID_CLASSES}>
			{documents.map((document) => (
				<DocumentCard
					key={document.id}
					clientId={clientId}
					companyId={companyId}
					document={document}
				/>
			))}
		</div>
	);
};
