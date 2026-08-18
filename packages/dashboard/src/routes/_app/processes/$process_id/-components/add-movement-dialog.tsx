import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";

import { MovementForm } from "./movement-form";

type AddMovementDialogProps = {
	processId: string;
	children: React.ReactNode;
};

export const AddMovementDialog = ({
	processId,
	children,
}: AddMovementDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Nova movimentação</DialogTitle>
				</DialogHeader>
				<MovementForm processId={processId} onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
