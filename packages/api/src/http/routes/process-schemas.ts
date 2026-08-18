import { z } from 'zod';

export const processBodySchema = z.object({
    caseNumber: z.string().trim().max(30).optional(),
    clientId: z.string(),
    plaintiff: z.string().trim().min(1, 'Informe o autor'),
    defendant: z.string().trim().min(1, 'Informe o réu'),
    notes: z.string().trim().max(5000).optional(),
});

export type ProcessBody = z.infer<typeof processBodySchema>;

export const processDetailSchema = z.object({
    id: z.string(),
    caseNumber: z.string().nullable(),
    clientId: z.string(),
    plaintiff: z.string(),
    defendant: z.string(),
    notes: z.string().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    client: z.object({
        id: z.string(),
        fullName: z.string(),
    }),
    user: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export type ProcessDetailRow = {
    id: string;
    caseNumber: string | null;
    clientId: string;
    plaintiff: string;
    defendant: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    client: {
        id: string;
        fullName: string;
    };
    user: {
        id: string;
        name: string;
    };
};

export const PROCESS_DETAIL_SELECT = {
    id: true,
    caseNumber: true,
    clientId: true,
    plaintiff: true,
    defendant: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    client: {
        select: {
            id: true,
            fullName: true,
        },
    },
    user: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

export const serializeProcessDetail = (process: ProcessDetailRow) => ({
    ...process,
    createdAt: process.createdAt.toISOString(),
    updatedAt: process.updatedAt.toISOString(),
});
