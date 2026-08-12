import { db } from '../db/prisma.js';
import { sendEmail } from './email.js';

const LOOKAHEAD_MS = 24 * 60 * 60 * 1000;

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
});

const buildReminderHtml = (title: string, description: string | null, startAt: Date) => `
    <p>Lembrete: <strong>${title}</strong> às ${dateTimeFormatter.format(startAt)}.</p>
    ${description ? `<p>${description}</p>` : ''}
`;

export const sendEventReminders = async () => {
    const now = new Date();

    const candidates = await db.event.findMany({
        where: {
            reminderMinutesBefore: { not: null },
            reminderSentAt: null,
            startAt: { gt: now, lte: new Date(now.getTime() + LOOKAHEAD_MS) },
        },
        select: {
            id: true,
            title: true,
            description: true,
            startAt: true,
            isGlobal: true,
            reminderMinutesBefore: true,
            user: { select: { email: true } },
        },
    });

    for (const event of candidates) {
        const dueAt = new Date(
            event.startAt.getTime() - (event.reminderMinutesBefore ?? 0) * 60 * 1000
        );

        if (dueAt > now) {
            continue;
        }

        const recipients = event.isGlobal
            ? (
                  await db.user.findMany({
                      where: { isActive: true },
                      select: { email: true },
                  })
              ).map((user) => user.email)
            : [event.user.email];

        const html = buildReminderHtml(event.title, event.description, event.startAt);

        try {
            await Promise.all(
                recipients.map((to) =>
                    sendEmail({
                        to,
                        subject: `Lembrete: ${event.title}`,
                        html,
                    })
                )
            );

            await db.event.update({
                where: { id: event.id },
                data: { reminderSentAt: now },
            });
        } catch (error) {
            console.error(`Falha ao enviar lembrete do evento ${event.id}`, error);
        }
    }
};
