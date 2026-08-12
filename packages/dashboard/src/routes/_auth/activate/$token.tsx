import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Scale, ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";

import { useActivateAccount } from "#/http/hooks/useActivateAccount";
import { getApiErrorMessage } from "#/lib/api-error";

const ActivateAccountRoute = () => {
	const { token } = Route.useParams();
	const navigate = useNavigate();
	const hasTriggered = useRef(false);

	const { mutate, isPending, isError, error } = useActivateAccount({
		mutation: {
			onSuccess: () => {
				navigate({ to: "/", replace: true });
			},
		},
	});

	useEffect(() => {
		if (hasTriggered.current) return;
		hasTriggered.current = true;
		mutate({ body: { token } });
	}, [token, mutate]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
			<div className="flex items-center gap-3">
				<div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
					<Scale className="size-4" aria-hidden="true" />
				</div>
				<p className="font-display text-base font-semibold text-foreground">
					Silveira &amp; Monteiro
				</p>
			</div>

			{isError ? (
				<div className="flex flex-col items-center gap-3">
					<ShieldAlert
						className="size-8 text-muted-foreground/50"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-foreground">
							{getApiErrorMessage(
								error,
								"Link de ativação inválido ou expirado",
							)}
						</p>
						<p className="text-sm text-muted-foreground">
							Peça um novo link ou entre com sua conta.
						</p>
					</div>
					<Link to="/sign-in" className="text-sm text-primary hover:underline">
						Ir para o login
					</Link>
				</div>
			) : (
				<div className="flex flex-col items-center gap-3">
					<Loader2
						className="size-6 animate-spin text-muted-foreground"
						aria-hidden="true"
					/>
					<p className="text-sm text-muted-foreground">
						{isPending ? "Ativando sua conta..." : "Redirecionando..."}
					</p>
				</div>
			)}
		</main>
	);
};

export const Route = createFileRoute("/_auth/activate/$token")({
	component: ActivateAccountRoute,
	head: () => ({ meta: [{ title: "Ativar conta | Silveira & Monteiro" }] }),
});
