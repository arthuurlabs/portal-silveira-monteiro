export function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getUpcomingWeekRange() {
	const from = startOfDay(new Date());
	const to = new Date(from);
	to.setDate(to.getDate() + 7);
	to.setHours(23, 59, 59, 999);

	return { from: from.toISOString(), to: to.toISOString() };
}

export function getTodayDateString() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getRelativeDayLabel(date: Date) {
	const today = startOfDay(new Date());
	const target = startOfDay(date);
	const diffDays = Math.round(
		(target.getTime() - today.getTime()) / 86_400_000,
	);

	if (diffDays === 0) return "Hoje";
	if (diffDays === 1) return "Amanhã";

	return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
}
