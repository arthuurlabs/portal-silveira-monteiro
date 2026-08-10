import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    JWT_SECRET: z.jwt(),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string(),
    RESEND_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
