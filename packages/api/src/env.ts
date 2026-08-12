import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    JWT_SECRET: z.jwt(),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string(),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string().min(1),
    DASHBOARD_URL: z.string().min(1),
    DEFAULT_USER_PASSWORD: z.string().default('admin123456'),
});

export const env = envSchema.parse(process.env);
