import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { ListProcessesStatus200 } from "#/http/types/ListProcesses";

import { ProcessForm } from "./process-form";

type ProcessListItem = ListProcessesStatus200["data"][number];

type ProcessUpsertDialogProps = {
	process?: ProcessListItem;
	children: React.ReactNode;
};

export const ProcessUpsertDialog = ({
	process,
	children,
}: ProcessUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{process ? "Editar processo" : "Novo processo"}
					</DialogTitle>
				</DialogHeader>
				<ProcessForm process={process} onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
