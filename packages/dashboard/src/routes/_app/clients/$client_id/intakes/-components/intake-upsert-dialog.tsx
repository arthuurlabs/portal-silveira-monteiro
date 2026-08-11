import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { ListIntakesStatus200 } from "#/http/types/ListIntakes";

import { IntakeForm } from "./intake-form";

type IntakeListItem = ListIntakesStatus200["data"][number];

type IntakeUpsertDialogProps = {
	clientId: string;
	intake?: IntakeListItem;
	children: React.ReactNode;
};

export const IntakeUpsertDialog = ({
	clientId,
	intake,
	children,
}: IntakeUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{intake ? "Editar atendimento" : "Novo atendimento"}
					</DialogTitle>
				</DialogHeader>
				<IntakeForm
					clientId={clientId}
					intake={intake}
					onSuccess={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
