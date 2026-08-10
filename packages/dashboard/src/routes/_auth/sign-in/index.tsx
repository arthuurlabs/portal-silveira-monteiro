import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";

import { LoginForm } from "./-components/login-form";

export const Route = createFileRoute("/_auth/sign-in/")({
	component: SignInRoute,
	head: () => ({
		meta: [{ title: "Entrar | Silveira & Monteiro" }],
	}),
});

function SignInRoute() {
	return (
		<main className="grid min-h-screen bg-background lg:grid-cols-[1fr_2rem_1fr]">
			<LetterheadPanel />
			<PerforationDivider />

			<section className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-8 flex items-center gap-3 lg:hidden">
						<div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Scale className="size-4" aria-hidden="true" />
						</div>
						<p className="font-display text-base font-semibold text-foreground">
							Silveira & Monteiro
						</p>
					</div>

					<h1 className="mt-6 font-display text-2xl font-medium tracking-tight text-foreground">
						Acesse sua conta
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Preencha os campos abaixo para continuar.
					</p>

					<div className="mt-8">
						<LoginForm />
					</div>

					<p className="mt-10 text-[0.6875rem] leading-relaxed text-muted-foreground">
						Acesso restrito à equipe do escritório. O uso deste sistema é
						monitorado e registrado.
					</p>
				</div>
			</section>
		</main>
	);
}

function LetterheadPanel() {
	return (
		<section className="relative hidden overflow-hidden bg-primary px-16 py-16 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
			<ScaleWatermark />

			<div className="relative flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-md bg-primary-foreground/10">
					<Scale className="size-5" aria-hidden="true" />
				</div>
				<div>
					<p className="font-display text-lg font-semibold leading-none">
						Silveira & Monteiro
					</p>
					<p className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
						Sistema jurídico
					</p>
				</div>
			</div>

			<div className="relative max-w-md">
				<p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-primary-foreground/60">
					Princípio de uso
				</p>
				<p className="mt-3 font-display text-3xl leading-snug">
					Clareza para decisões que não admitem ruído.
				</p>
			</div>

			<p className="relative font-mono text-[0.6875rem] tracking-wide text-primary-foreground/40">
				Via retida · uso interno
			</p>
		</section>
	);
}

const WATERMARK_ROWS = ["a", "b", "c", "d", "e", "f"];
const WATERMARK_COLS = ["a", "b", "c", "d", "e"];

function ScaleWatermark() {
	return (
		<div
			className="pointer-events-none absolute inset-0 select-none overflow-hidden"
			aria-hidden="true"
		>
			<div className="absolute inset-0 flex -rotate-6 flex-col justify-between gap-10 p-6 opacity-[0.08]">
				{WATERMARK_ROWS.map((row, i) => (
					<div
						key={row}
						className="flex justify-between gap-10"
						style={{ marginLeft: i % 2 === 0 ? 0 : "2.5rem" }}
					>
						{WATERMARK_COLS.map((col) => (
							<Scale
								key={col}
								className="size-10 shrink-0"
								strokeWidth={1.25}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

function PerforationDivider() {
	return (
		<div className="relative hidden lg:block" aria-hidden="true">
			<div className="absolute inset-y-12 left-1/2 w-px -translate-x-1/2 border-l-2 border-dashed border-border" />
			<div className="absolute inset-y-12 left-1/2 flex w-px -translate-x-1/2 flex-col justify-between">
				{["a", "b", "c", "d", "e", "f", "g", "h", "i"].map((hole) => (
					<span
						key={hole}
						className="-ml-1.5 size-3 rounded-full border border-border bg-background"
					/>
				))}
			</div>
		</div>
	);
}
