import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { db } from '../src/db/prisma.js';
import { UserRole } from '../src/generated/prisma/enums.js';

const ADMIN_EMAIL = 'admin@portalsilveiramonteiro.com.br';
const ADMIN_NAME = 'Admin';


async function main() {
    const password = process.env.ADMIN_SEED_PASSWORD;

    if (!password || password.length < 12) {
        throw new Error('ADMIN_SEED_PASSWORD deve possuir pelo menos 12 caracteres');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.upsert({
        where: { email: ADMIN_EMAIL },
        create: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            passwordHash,
            role: UserRole.ADMIN,
        },
        update: {
            name: ADMIN_NAME,
            passwordHash,
            role: UserRole.ADMIN,
            isActive: true,
        },
    });

    console.info(`Usuário administrador configurado: ${ADMIN_EMAIL}`);
}

main()
    .catch((error: unknown) => {
        console.error('Falha ao executar o seed', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
