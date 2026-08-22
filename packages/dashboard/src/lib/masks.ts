export const CPF_MASK = "000.000.000-00";
export const CNPJ_MASK = "00.000.000/0000-00";
export const RG_MASK = "00.000.000-0";
export const PHONE_MASK = [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }];

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const formatCpf = (value: string | null | undefined) => {
	if (!value) return null;
	const digits = onlyDigits(value).slice(0, 11);
	return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
};

export const formatCnpj = (value: string | null | undefined) => {
	if (!value) return null;
	const digits = onlyDigits(value).slice(0, 14);
	return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
};
