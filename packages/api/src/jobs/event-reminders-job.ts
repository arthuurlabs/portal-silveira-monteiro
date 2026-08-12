import cron from 'node-cron';

import { sendEventReminders } from '../lib/send-event-reminders.js';

export const startEventRemindersJob = () => {
    cron.schedule('*/5 * * * *', () => {
        sendEventReminders().catch((error) => {
            console.error('Falha ao processar lembretes de evento', error);
        });
    });
};
