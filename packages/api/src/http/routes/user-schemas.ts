import { z } from 'zod';

import { UserRole } from '../../generated/prisma/enums.js';

export const userCreateBodySchema = z.object({
    name: z.string().trim().min(1, 'Informe o nome').max(180),
    email: z.email('Informe um e-mail válido').trim().toLowerCase(),
    role: z.enum(UserRole),
});

export type UserCreateBody = z.infer<typeof userCreateBodySchema>;

export const userDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(UserRole),
    isActive: z.boolean(),
    createdAt: z.iso.datetime(),
});

export type UserDetailRow = {
    id: string;
    name: string;
    email: string;
    role: (typeof UserRole)[keyof typeof UserRole];
    isActive: boolean;
    createdAt: Date;
};

export const USER_DETAIL_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
} as const;

export const serializeUserDetail = (user: UserDetailRow) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
});
