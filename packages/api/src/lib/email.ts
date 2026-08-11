import { Resend } from 'resend';

import { env } from '../env.js';

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (input: { to: string; subject: string; html: string }) => {
    const { error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
    });

    if (error) {
        throw new Error(error.message);
    }
};
