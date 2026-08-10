import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, FileText, Scale, Search } from "lucide-react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/_app/")({
	component: DesignSystemRoute,
	head: () => ({ meta: [{ title: "Design system | Silveira & Monteiro" }] }),
});

const colors = [
	{ name: "Azul-tinta", value: "#123D4A", className: "bg-primary" },
	{ name: "Papel técnico", value: "#F4F7F7", className: "bg-background" },
	{ name: "Cobre", value: "#A7653F", className: "bg-accent" },
	{ name: "Êxito", value: "#26705A", className: "bg-success" },
	{ name: "Atenção", value: "#9B681D", className: "bg-warning" },
	{ name: "Risco", value: "#B63D3D", className: "bg-destructive" },
];

function DesignSystemRoute() {
	return (
		<main className="min-h-screen">
			<header className="border-b bg-card">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
							<Scale className="size-5" aria-hidden="true" />
						</div>
						<div>
							<p className="font-display text-lg font-semibold leading-none">
								Silveira & Monteiro
							</p>
							<p className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								Sistema jurídico
							</p>
						</div>
					</div>
					<Badge variant="neutral">Design system · v1.0</Badge>
				</div>
			</header>

			<div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
				<section className="grid gap-10 border-b pb-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
					<div>
						<p className="sm-eyebrow">Fundamentos da interface</p>
						<div className="sm-rule my-5" aria-hidden="true" />
						<h1 className="sm-display max-w-3xl">
							Clareza para decisões que não admitem ruído.
						</h1>
					</div>
					<p className="max-w-xl text-base leading-7 text-muted-foreground lg:pb-1">
						Uma linguagem visual sóbria e operacional para processos, clientes,
						prazos e documentos. A hierarquia prioriza leitura rápida sem abrir
						mão do rigor institucional.
					</p>
				</section>

				<section className="border-b py-12" aria-labelledby="cores-title">
					<SectionHeading
						id="cores-title"
						label="01 · Fundações"
						title="Cores semânticas"
						description="Cada cor comunica uma função. O cobre destaca decisões; nunca preenche grandes superfícies."
					/>
					<div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						{colors.map((color) => (
							<div
								key={color.name}
								className="overflow-hidden rounded-lg border bg-card shadow-soft"
							>
								<div className={`h-24 ${color.className}`} />
								<div className="px-3 py-3">
									<p className="text-xs font-bold">{color.name}</p>
									<p className="mt-1 font-mono text-[0.6875rem] text-muted-foreground">
										{color.value}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section
					className="grid gap-12 border-b py-12 lg:grid-cols-2"
					aria-labelledby="tipo-title"
				>
					<div>
						<SectionHeading
							id="tipo-title"
							label="02 · Tipografia"
							title="Voz e hierarquia"
							description="Fraunces dá autoridade aos títulos. Manrope sustenta leitura contínua, dados e controles."
						/>
						<div className="mt-8 space-y-6 rounded-lg border bg-card p-6 shadow-soft">
							<div>
								<p className="sm-eyebrow">Título editorial · Fraunces 500</p>
								<p className="mt-2 font-display text-4xl leading-tight">
									Precisão jurídica, em contexto.
								</p>
							</div>
							<div className="border-t pt-5">
								<p className="sm-eyebrow">Interface · Manrope 400–800</p>
								<p className="mt-2 max-w-lg leading-7 text-muted-foreground">
									Acompanhe movimentações, responsáveis e próximos prazos sem
									perder o histórico do caso.
								</p>
							</div>
						</div>
					</div>

					<div>
						<SectionHeading
							label="03 · Controles"
							title="Ações e estados"
							description="Verbos diretos e contraste proporcional à importância da ação."
						/>
						<div className="mt-8 space-y-7 rounded-lg border bg-card p-6 shadow-soft">
							<div className="flex flex-wrap gap-3">
								<Button>Salvar alterações</Button>
								<Button variant="accent">Protocolar</Button>
								<Button variant="outline">Cancelar</Button>
								<Button variant="ghost" size="icon" aria-label="Pesquisar">
									<Search />
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge>Em análise</Badge>
								<Badge variant="success">Prazo cumprido</Badge>
								<Badge variant="warning">Vence amanhã</Badge>
								<Badge variant="destructive">Atrasado</Badge>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="processo">Número do processo</Label>
								<Input id="processo" placeholder="0000000-00.0000.0.00.0000" />
								<p className="text-xs text-muted-foreground">
									Use o número completo conforme o tribunal.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="py-12" aria-labelledby="composicao-title">
					<SectionHeading
						id="composicao-title"
						label="04 · Composição"
						title="Informação em contexto"
						description="Cartões agrupam uma decisão ou assunto completo; não servem como decoração."
					/>
					<div className="mt-8 grid gap-5 lg:grid-cols-3">
						<Card className="lg:col-span-2">
							<CardHeader className="flex-row items-start justify-between">
								<div>
									<CardTitle>Contestação · Almeida Comércio</CardTitle>
									<CardDescription>
										Processo 1008421-32.2026.8.26.0100
									</CardDescription>
								</div>
								<Badge variant="warning">Vence em 2 dias</Badge>
							</CardHeader>
							<CardContent className="grid gap-5 sm:grid-cols-3">
								<Datum label="Responsável" value="Marina Silveira" />
								<Datum label="Área" value="Contencioso cível" />
								<Datum label="Última atualização" value="Hoje, 09:42" />
							</CardContent>
							<CardFooter>
								<Button variant="outline" size="sm">
									<FileText /> Ver documentos
								</Button>
								<Button variant="link" size="sm">
									Abrir processo <ArrowRight />
								</Button>
							</CardFooter>
						</Card>

						<Card className="border-primary/20 bg-primary text-primary-foreground">
							<CardContent className="flex h-full flex-col justify-between gap-10 py-6">
								<div className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10">
									<Check className="size-5" />
								</div>
								<div>
									<p className="sm-eyebrow text-primary-foreground/60">
										Princípio de uso
									</p>
									<p className="mt-3 font-display text-2xl leading-snug">
										A interface deve tornar o próximo passo evidente.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>
			</div>
		</main>
	);
}

function SectionHeading({
	id,
	label,
	title,
	description,
}: {
	id?: string;
	label: string;
	title: string;
	description: string;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-[15rem_1fr] md:items-start">
			<p className="sm-eyebrow pt-1">{label}</p>
			<div>
				<h2
					id={id}
					className="font-display text-2xl font-medium tracking-tight md:text-3xl"
				>
					{title}
				</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

function Datum({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="sm-eyebrow">{label}</p>
			<p className="mt-2 text-sm font-semibold">{value}</p>
		</div>
	);
}
