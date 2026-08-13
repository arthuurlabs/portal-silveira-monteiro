import { createContext, useContext, useEffect, useState } from "react";
import { type EventData, Joyride, STATUS, type Step } from "react-joyride";

import type { GetMeStatus200 } from "#/http/types/GetMe";

import { TourTooltip } from "./tour-tooltip";

type TourContextValue = {
	startTour: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export const useTour = () => {
	const context = useContext(TourContext);

	if (!context) {
		throw new Error("useTour deve ser usado dentro de <TourProvider>");
	}

	return context;
};

const buildSteps = (userName: string, isAdmin: boolean): Step[] => {
	const steps: Step[] = [
		{
			target: "body",
			placement: "center",
			title: "Bem-vindo(a)!",
			content: `Olá, ${userName}! Vamos mostrar rapidamente onde encontrar tudo no sistema.`,
		},
		{
			target: '[data-tour="nav-painel"]',
			title: "Painel",
			content: "Aqui você vê um resumo geral do escritório.",
		},
		{
			target: '[data-tour="nav-clientes"]',
			title: "Clientes",
			content:
				"Cadastre clientes e gerencie seus atendimentos, empresas, arquivos e modelos de documentos.",
		},
		{
			target: '[data-tour="nav-tarefas"]',
			title: "Tarefas",
			content: "Organize as tarefas do dia a dia em um quadro kanban.",
		},
		{
			target: '[data-tour="nav-calendario"]',
			title: "Calendário",
			content:
				"Marque compromissos pessoais ou avisos para todo o escritório, com lembrete por e-mail.",
		},
	];

	if (isAdmin) {
		steps.push({
			target: '[data-tour="nav-usuarios"]',
			title: "Usuários",
			content: "Gerencie quem tem acesso ao sistema.",
		});
	}

	steps.push({
		target: '[data-tour="nav-user-menu"]',
		title: "Reabrir o tour",
		content: "Você pode reabrir este tour por aqui sempre que precisar.",
	});

	return steps;
};

const tourSeenKey = (userId: string) => `tour-seen:${userId}`;

type TourProviderProps = {
	user: GetMeStatus200;
	children: React.ReactNode;
};

export const TourProvider = ({ user, children }: TourProviderProps) => {
	const [mounted, setMounted] = useState(false);
	const [run, setRun] = useState(false);
	const [tourKey, setTourKey] = useState(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		if (!localStorage.getItem(tourSeenKey(user.id))) {
			setRun(true);
		}
	}, [mounted, user.id]);

	const startTour = () => {
		setTourKey((key) => key + 1);
		setRun(true);
	};

	const handleEvent = (data: EventData) => {
		if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
			setRun(false);
			localStorage.setItem(tourSeenKey(user.id), "1");
		}
	};

	return (
		<TourContext.Provider value={{ startTour }}>
			{children}
			{mounted ? (
				<Joyride
					key={tourKey}
					steps={buildSteps(user.name, user.role === "ADMIN")}
					run={run}
					continuous
					scrollToFirstStep
					tooltipComponent={TourTooltip}
					locale={{
						back: "Voltar",
						close: "Fechar",
						last: "Concluir",
						next: "Próximo",
						skip: "Pular",
					}}
					options={{
						primaryColor: "var(--primary)",
						arrowColor: "var(--card)",
						overlayColor: "rgba(12, 32, 39, 0.6)",
						spotlightRadius: 8,
						zIndex: 10000,
						closeButtonAction: "skip",
					}}
					onEvent={handleEvent}
				/>
			) : null}
		</TourContext.Provider>
	);
};
