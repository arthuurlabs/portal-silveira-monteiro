import { ResponseError } from "#/http/.kubb/client";

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ResponseError) {
		const data = error.data as { message?: string } | undefined;

		if (data && typeof data.message === "string") {
			return data.message;
		}
	}

	return fallback;
}
