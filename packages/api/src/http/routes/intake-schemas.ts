import { z } from 'zod';

import { NextStep, PracticeArea, ReferralSource } from '../../generated/prisma/enums.js';

export const intakeBodySchema = z.object({
    practiceAreas: z.array(z.enum(PracticeArea)).default([]),
    practiceAreaOther: z.string().trim().max(120).optional(),
    clientReport: z.string().trim().max(5000).optional(),
    lawyerAnalysis: z.string().trim().max(5000).optional(),
    nextSteps: z.array(z.enum(NextStep)).default([]),
    nextStepsOther: z.string().trim().max(120).optional(),
    feeAmount: z.number().min(0).optional(),
    paymentMethod: z.string().trim().max(60).optional(),
    referralSource: z.enum(ReferralSource).optional(),
    referredByName: z.string().trim().max(120).optional(),
    referralSourceOther: z.string().trim().max(120).optional(),
    lgpdConsent: z.boolean().default(false),
});

export type IntakeBody = z.infer<typeof intakeBodySchema>;

export const intakeDetailSchema = z.object({
    id: z.string(),
    clientId: z.string(),
    practiceAreas: z.array(z.enum(PracticeArea)),
    practiceAreaOther: z.string().nullable(),
    clientReport: z.string().nullable(),
    lawyerAnalysis: z.string().nullable(),
    nextSteps: z.array(z.enum(NextStep)),
    nextStepsOther: z.string().nullable(),
    feeAmount: z.number().nullable(),
    paymentMethod: z.string().nullable(),
    referralSource: z.enum(ReferralSource).nullable(),
    referredByName: z.string().nullable(),
    referralSourceOther: z.string().nullable(),
    lgpdConsent: z.boolean(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    user: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export type IntakeDetailRow = {
    id: string;
    clientId: string;
    practiceAreas: PracticeArea[];
    practiceAreaOther: string | null;
    clientReport: string | null;
    lawyerAnalysis: string | null;
    nextSteps: NextStep[];
    nextStepsOther: string | null;
    feeAmount: number | null;
    paymentMethod: string | null;
    referralSource: ReferralSource | null;
    referredByName: string | null;
    referralSourceOther: string | null;
    lgpdConsent: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string;
    };
};

export const INTAKE_DETAIL_SELECT = {
    id: true,
    clientId: true,
    practiceAreas: true,
    practiceAreaOther: true,
    clientReport: true,
    lawyerAnalysis: true,
    nextSteps: true,
    nextStepsOther: true,
    feeAmount: true,
    paymentMethod: true,
    referralSource: true,
    referredByName: true,
    referralSourceOther: true,
    lgpdConsent: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            id: true,
            name: true,
        },
    },
} as const;

export const serializeIntakeDetail = (intake: IntakeDetailRow) => ({
    ...intake,
    createdAt: intake.createdAt.toISOString(),
    updatedAt: intake.updatedAt.toISOString(),
});
