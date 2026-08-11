import { z } from 'zod';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const taskCreateBodySchema = z.object({
    title: z.string().trim().min(1, 'Informe o título').max(180),
    description: z.string().trim().max(2000).optional(),
    dueDate: z.iso.date().optional(),
    status: taskStatusSchema.optional(),
});

export type TaskCreateBody = z.infer<typeof taskCreateBodySchema>;

export const taskUpdateBodySchema = z.object({
    title: z.string().trim().min(1, 'Informe o título').max(180).optional(),
    description: z.string().trim().max(2000).optional(),
    dueDate: z.iso.date().optional(),
});

export type TaskUpdateBody = z.infer<typeof taskUpdateBodySchema>;

export const moveTaskBodySchema = z.object({
    status: taskStatusSchema,
    orderedIds: z.array(z.string()).min(1),
});

export type MoveTaskBody = z.infer<typeof moveTaskBodySchema>;

export const taskDetailSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    status: taskStatusSchema,
    position: z.number(),
    dueDate: z.iso.date().nullable(),
    createdAt: z.iso.datetime(),
});

export type TaskDetailRow = {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    position: number;
    dueDate: Date | null;
    createdAt: Date;
};

export const TASK_DETAIL_SELECT = {
    id: true,
    title: true,
    description: true,
    status: true,
    position: true,
    dueDate: true,
    createdAt: true,
} as const;

export const serializeTaskDetail = (task: TaskDetailRow) => ({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
    createdAt: task.createdAt.toISOString(),
});
