import { AlertCircle, FolderOpen } from "lucide-react";

import { EmptyState } from "#/components/shared/empty-state";
import { Alert, AlertDescription } from "#/components/ui/alert";
import { Skeleton } from "#/components/ui/skeleton";
import type { ListDocumentsStatus200 } from "#/http/types/ListDocuments";

import { DocumentCard } from "./document-card";

type DocumentListItem = ListDocumentsStatus200["data"][number];

type DocumentListProps = {
	clientId: string;
	documents: DocumentListItem[] | undefined;
	isPending: boolean;
	isError: boolean;
};

const SKELETON_TILES = ["tile-1", "tile-2", "tile-3", "tile-4", "tile-5"];

const GRID_CLASSES =
	"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export const DocumentList = ({
	clientId,
	documents,
	isPending,
	isError,
}: DocumentListProps) => {
	if (isError) {
		return (
			<Alert variant="danger">
				<AlertCircle />
				<AlertDescription>
					Não foi possível carregar os documentos. Tente novamente.
				</AlertDescription>
			</Alert>
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
			<EmptyState icon={FolderOpen} title="Nenhum documento enviado ainda." />
		);
	}

	return (
		<div className={GRID_CLASSES}>
			{documents.map((document) => (
				<DocumentCard
					key={document.id}
					clientId={clientId}
					document={document}
				/>
			))}
		</div>
	);
};
