import { z } from 'zod';

export const eventBodySchema = z.object({
    title: z.string().trim().min(1, 'Informe o título').max(180),
    description: z.string().trim().max(2000).optional(),
    startAt: z.iso.datetime(),
    isGlobal: z.boolean().optional(),
    reminderMinutesBefore: z.number().int().min(0).max(10080).optional(),
});

export type EventBody = z.infer<typeof eventBodySchema>;

export const eventDetailSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    startAt: z.iso.datetime(),
    isGlobal: z.boolean(),
    reminderMinutesBefore: z.number().nullable(),
    createdAt: z.iso.datetime(),
});

export type EventDetailRow = {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    startAt: Date;
    isGlobal: boolean;
    reminderMinutesBefore: number | null;
    createdAt: Date;
};

export const EVENT_DETAIL_SELECT = {
    id: true,
    userId: true,
    title: true,
    description: true,
    startAt: true,
    isGlobal: true,
    reminderMinutesBefore: true,
    createdAt: true,
} as const;

export const serializeEventDetail = (event: EventDetailRow) => ({
    ...event,
    startAt: event.startAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
});
