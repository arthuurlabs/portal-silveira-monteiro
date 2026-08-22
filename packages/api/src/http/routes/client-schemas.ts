import { z } from 'zod';

const baseClientFields = z.object({
    phone: z.string().trim().max(30).optional(),
    email: z.email('Informe um e-mail válido').optional(),
    address: z.string().trim().max(255).optional(),
    isActive: z.boolean().optional(),
});

export const clientBodySchema = z.discriminatedUnion('personType', [
    baseClientFields.extend({
        personType: z.literal('FISICA'),
        fullName: z.string().trim().min(1, 'Informe o nome completo').max(180),
        cpf: z.string().trim().min(11, 'Informe um CPF válido').max(14),
        rg: z.string().trim().max(20).optional(),
        birthDate: z.iso.date().optional(),
        maritalStatus: z.string().trim().max(60).optional(),
        profession: z.string().trim().max(120).optional(),
    }),
    baseClientFields.extend({
        personType: z.literal('JURIDICA'),
        cnpj: z.string().trim().min(14, 'Informe um CNPJ válido').max(18),
        razaoSocial: z.string().trim().min(1, 'Informe a razão social').max(180),
        nomeFantasia: z.string().trim().max(180).optional(),
    }),
]);

export type ClientBody = z.infer<typeof clientBodySchema>;

export const clientDetailSchema = z.object({
    id: z.string(),
    personType: z.enum(['FISICA', 'JURIDICA']),
    fullName: z.string(),
    cpf: z.string().nullable(),
    rg: z.string().nullable(),
    birthDate: z.iso.date().nullable(),
    maritalStatus: z.string().nullable(),
    profession: z.string().nullable(),
    cnpj: z.string().nullable(),
    razaoSocial: z.string().nullable(),
    nomeFantasia: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
});

export type ClientDetailRow = {
    id: string;
    personType: 'FISICA' | 'JURIDICA';
    fullName: string;
    cpf: string | null;
    rg: string | null;
    birthDate: Date | null;
    maritalStatus: string | null;
    profession: string | null;
    cnpj: string | null;
    razaoSocial: string | null;
    nomeFantasia: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
};

export const CLIENT_DETAIL_SELECT = {
    id: true,
    personType: true,
    fullName: true,
    cpf: true,
    rg: true,
    birthDate: true,
    maritalStatus: true,
    profession: true,
    cnpj: true,
    razaoSocial: true,
    nomeFantasia: true,
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
