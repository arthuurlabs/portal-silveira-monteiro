import { z } from "zod";

export const authUserResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	role: z.enum(["ADMIN", "MEMBER"]),
	isActive: z.boolean(),
});
