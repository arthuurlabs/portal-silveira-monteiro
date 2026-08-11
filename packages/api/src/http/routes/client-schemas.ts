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
