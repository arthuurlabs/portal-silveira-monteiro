import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export const signOut = (app: FastifyInstance) =>
	app.withTypeProvider<ZodTypeProvider>().post(
		"/auth/sign-out",
		{
			schema: {
				tags: ["Auth"],
				summary: "Sair do sistema",
				operationId: "signOut",
				response: {
					200: z.object({ message: z.string() }),
				},
			},
		},
		async (_request, reply) =>
			reply
				.clearCookie("token", { path: "/" })
				.status(200)
				.send({ message: "Sessão encerrada" }),
	);
