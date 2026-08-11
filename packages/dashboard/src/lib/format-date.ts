export const formatDate = (value: string | null) => {
	if (!value) return null;
	return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
};
