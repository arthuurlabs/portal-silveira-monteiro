import type { GetClientStatus200 } from "#/http/types/GetClient";
import { formatDate } from "#/lib/format-date";

export const buildClientQualification = (client: GetClientStatus200) => {
	if (client.personType === "JURIDICA") {
		const parts = [client.razaoSocial ?? client.fullName];

		if (client.nomeFantasia) parts.push(`também conhecida como ${client.nomeFantasia}`);
		parts.push(`inscrita no CNPJ sob o nº ${client.cnpj}`);
		if (client.address) parts.push(`com sede à ${client.address}`);
		if (client.email) parts.push(`e-mail ${client.email}`);

		return `${parts.join(", ")}.`;
	}

	const parts = [client.fullName, "brasileiro(a)"];

	if (client.maritalStatus) parts.push(client.maritalStatus);
	if (client.profession) parts.push(client.profession);
	parts.push(`inscrito(a) no CPF sob o nº ${client.cpf}`);
	if (client.rg) parts.push(`RG nº ${client.rg}`);
	if (client.birthDate)
		parts.push(`nascido(a) em ${formatDate(client.birthDate)}`);
	if (client.address)
		parts.push(`residente e domiciliado(a) à ${client.address}`);
	if (client.email) parts.push(`e-mail ${client.email}`);

	return `${parts.join(", ")}.`;
};
