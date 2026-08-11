import { z } from 'zod';

export const templateBlockSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('paragraph'),
        text: z.string(),
        breakBefore: z.boolean().optional(),
    }),
    z.object({
        type: z.literal('signature-line'),
        label: z.string().optional(),
        breakBefore: z.boolean().optional(),
    }),
]);

export const templateContentSchema = z.object({
    blocks: z.array(templateBlockSchema),
});

export type TemplateContent = z.infer<typeof templateContentSchema>;
export type TemplateBlock = z.infer<typeof templateBlockSchema>;

export const templateListItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
});

export const templateDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    title: z.string(),
    content: templateContentSchema,
});

export type TemplateListRow = {
    id: string;
    name: string;
    description: string;
};

export type TemplateDetailRow = {
    id: string;
    name: string;
    description: string;
    title: string;
    content: unknown;
};

export const TEMPLATE_LIST_SELECT = {
    id: true,
    name: true,
    description: true,
} as const;

export const TEMPLATE_DETAIL_SELECT = {
    id: true,
    name: true,
    description: true,
    title: true,
    content: true,
} as const;

export const serializeTemplateDetail = (template: TemplateDetailRow) => ({
    ...template,
    content: templateContentSchema.parse(template.content),
});
