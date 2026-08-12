import { type UseMutationOptions, useMutation } from "@tanstack/react-query";

import { client, type ResponseErrorConfig } from "#/http/.kubb/client";
import type { UploadDocumentStatus201 } from "#/http/types/UploadDocument";

type UploadDocumentInput = {
	clientId: string;
	companyId?: string;
	file: File;
};

const uploadDocument = async ({
	clientId,
	companyId,
	file,
}: UploadDocumentInput): Promise<UploadDocumentStatus201> => {
	const formData = new FormData();

	if (companyId) {
		formData.append("companyId", companyId);
	}

	formData.append("file", file);

	const result = await client({
		method: "POST",
		url: "/clients/{clientId}/documents",
		path: { clientId },
		body: formData,
		security: [{ type: "apiKey", name: "token", in: "cookie" }],
		throwOnError: true,
	});

	return result.data as UploadDocumentStatus201;
};

export const useUploadDocument = (
	options: {
		mutation?: UseMutationOptions<
			UploadDocumentStatus201,
			ResponseErrorConfig<Error>,
			UploadDocumentInput
		>;
	} = {},
) => {
	return useMutation({
		mutationFn: uploadDocument,
		...options.mutation,
	});
};
