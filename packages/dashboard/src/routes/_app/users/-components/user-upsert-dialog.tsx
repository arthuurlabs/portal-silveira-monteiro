import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";

import { UserForm } from "./user-form";

type UserUpsertDialogProps = {
	children: React.ReactNode;
};

export const UserUpsertDialog = ({ children }: UserUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Novo usuário</DialogTitle>
				</DialogHeader>
				<UserForm onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
