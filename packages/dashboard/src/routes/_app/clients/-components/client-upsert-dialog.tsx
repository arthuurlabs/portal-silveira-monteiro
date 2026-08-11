import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { ListClientsStatus200 } from "#/http/types/ListClients";

import { ClientForm } from "./client-form";

type ClientListItem = ListClientsStatus200["data"][number];

type ClientUpsertDialogProps = {
	client?: ClientListItem;
	children: React.ReactNode;
};

export const ClientUpsertDialog = ({
	client,
	children,
}: ClientUpsertDialogProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{client ? "Editar cliente" : "Novo cliente"}
					</DialogTitle>
				</DialogHeader>
				<ClientForm client={client} onSuccess={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};
