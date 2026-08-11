import { z } from 'zod';

export const clientBodySchema = z.object({
    fullName: z.string().trim().min(1, 'Informe o nome completo').max(180),
    cpf: z.string().trim().min(11, 'Informe um CPF válido').max(14),
    rg: z.string().trim().max(20).optional(),
    birthDate: z.iso.date().optional(),
    maritalStatus: z.string().trim().max(60).optional(),
    profession: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.email('Informe um e-mail válido').optional(),
    address: z.string().trim().max(255).optional(),
    isActive: z.boolean().optional(),
});

export type ClientBody = z.infer<typeof clientBodySchema>;

export const clientDetailSchema = z.object({
    id: z.string(),
    fullName: z.string(),
    cpf: z.string(),
    rg: z.string().nullable(),
    birthDate: z.iso.date().nullable(),
    maritalStatus: z.string().nullable(),
    profession: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
});

export type ClientDetailRow = {
    id: string;
    fullName: string;
    cpf: string;
    rg: string | null;
    birthDate: Date | null;
    maritalStatus: string | null;
    profession: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
};

export const CLIENT_DETAIL_SELECT = {
    id: true,
    fullName: true,
    cpf: true,
    rg: true,
    birthDate: true,
    maritalStatus: true,
    profession: true,
    phone: true,
    email: true,
    address: true,
    isActive: true,
    createdAt: true,
} as const;

export const serializeClientDetail = (client: ClientDetailRow) => ({
    ...client,
    birthDate: client.birthDate ? client.birthDate.toISOString().slice(0, 10) : null,
    createdAt: client.createdAt.toISOString(),
});
