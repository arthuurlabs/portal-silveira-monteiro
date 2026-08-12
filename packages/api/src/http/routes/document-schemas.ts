import { z } from 'zod';

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

export const documentDetailSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    companyId: z.string().nullable(),
    originalName: z.string(),
    mimeType: z.string(),
    size: z.number(),
    createdAt: z.iso.datetime(),
});

export type DocumentDetailRow = {
    id: string;
    clientId: string;
    companyId: string | null;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: Date;
};

export const DOCUMENT_DETAIL_SELECT = {
    id: true,
    clientId: true,
    companyId: true,
    originalName: true,
    mimeType: true,
    size: true,
    createdAt: true,
} as const;

export const serializeDocumentDetail = (document: DocumentDetailRow) => ({
    ...document,
    createdAt: document.createdAt.toISOString(),
});
