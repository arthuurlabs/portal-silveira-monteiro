import { z } from 'zod';

export const processMovementBodySchema = z.object({
    description: z.string().trim().min(1, 'Informe a descrição da movimentação').max(2000),
    occurredAt: z.iso.date(),
});

export type ProcessMovementBody = z.infer<typeof processMovementBodySchema>;

export const processMovementDetailSchema = z.object({
    id: z.string(),
    processId: z.string(),
    description: z.string(),
    occurredAt: z.iso.date(),
    createdAt: z.iso.datetime(),
});

export type ProcessMovementDetailRow = {
    id: string;
    processId: string;
    description: string;
    occurredAt: Date;
    createdAt: Date;
};

export const PROCESS_MOVEMENT_DETAIL_SELECT = {
    id: true,
    processId: true,
    description: true,
    occurredAt: true,
    createdAt: true,
} as const;

export const serializeProcessMovementDetail = (movement: ProcessMovementDetailRow) => ({
    ...movement,
    occurredAt: movement.occurredAt.toISOString().slice(0, 10),
    createdAt: movement.createdAt.toISOString(),
});
