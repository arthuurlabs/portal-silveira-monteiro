import { z } from 'zod';

export const companyBodySchema = z.object({
    cnpj: z.string().trim().min(14, 'Informe um CNPJ válido').max(18),
    razaoSocial: z.string().trim().min(1, 'Informe a razão social').max(180),
    nomeFantasia: z.string().trim().max(180).optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.email('Informe um e-mail válido').optional(),
    address: z.string().trim().max(255).optional(),
    isActive: z.boolean().optional(),
});

export type CompanyBody = z.infer<typeof companyBodySchema>;

export const companyDetailSchema = z.object({
    id: z.string(),
    cnpj: z.string(),
    razaoSocial: z.string(),
    nomeFantasia: z.string().nullable(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    isActive: z.boolean(),
    legalRepresentativeId: z.string(),
    createdAt: z.iso.datetime(),
});

export type CompanyDetailRow = {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    isActive: boolean;
    legalRepresentativeId: string;
    createdAt: Date;
};

export const COMPANY_DETAIL_SELECT = {
    id: true,
    cnpj: true,
    razaoSocial: true,
    nomeFantasia: true,
    phone: true,
    email: true,
    address: true,
    isActive: true,
    legalRepresentativeId: true,
    createdAt: true,
} as const;

export const serializeCompanyDetail = (company: CompanyDetailRow) => ({
    ...company,
    createdAt: company.createdAt.toISOString(),
});
