import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { db } from '../src/db/prisma.js';
import { UserRole } from '../src/generated/prisma/enums.js';

const ADMIN_EMAIL = 'admin@portalsilveiramonteiro.com.br';
const ADMIN_NAME = 'Admin';

const SEED_CLIENTS = [
    {
        fullName: 'Ana Beatriz Ferreira Lima',
        cpf: '111.222.333-44',
        rg: '12.345.678-9',
        birthDate: new Date('1988-04-12'),
        maritalStatus: 'Casada',
        profession: 'Professora',
        phone: '(21) 99887-1122',
        email: 'ana.lima@example.com',
        address: 'Rua das Flores, 120 - Copacabana, Rio de Janeiro - RJ',
        isActive: true,
    },
    {
        fullName: 'Carlos Eduardo Souza Martins',
        cpf: '222.333.444-55',
        rg: '23.456.789-0',
        birthDate: new Date('1979-11-03'),
        maritalStatus: 'Solteiro',
        profession: 'Engenheiro Civil',
        phone: '(21) 98765-4321',
        email: 'carlos.martins@example.com',
        address: 'Avenida Ataulfo de Paiva, 500 - Leblon, Rio de Janeiro - RJ',
        isActive: true,
    },
    {
        fullName: 'Fernanda Costa Ribeiro',
        cpf: '333.444.555-66',
        rg: '34.567.890-1',
        birthDate: new Date('1992-07-22'),
        maritalStatus: 'Divorciada',
        profession: 'Empresária',
        phone: '(21) 97654-3210',
        email: 'fernanda.ribeiro@example.com',
        address: 'Rua Barão da Torre, 300 - Ipanema, Rio de Janeiro - RJ',
        isActive: true,
    },
    {
        fullName: 'João Pedro Almeida Santos',
        cpf: '444.555.666-77',
        rg: '45.678.901-2',
        birthDate: new Date('1975-01-30'),
        maritalStatus: 'Casado',
        profession: 'Motorista de aplicativo',
        phone: '(21) 96543-2109',
        email: 'joao.santos@example.com',
        address: 'Rua Voluntários da Pátria, 45 - Botafogo, Rio de Janeiro - RJ',
        isActive: false,
    },
    {
        fullName: 'Mariana Alves Pereira',
        cpf: '555.666.777-88',
        rg: '56.789.012-3',
        birthDate: new Date('1960-09-18'),
        maritalStatus: 'Viúva',
        profession: 'Aposentada',
        phone: '(21) 95432-1098',
        email: 'mariana.pereira@example.com',
        address: 'Rua Marquês de Abrantes, 88 - Flamengo, Rio de Janeiro - RJ',
        isActive: true,
    },
];

async function seedAdmin() {
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

async function seedClients() {
    for (const client of SEED_CLIENTS) {
        await db.client.upsert({
            where: { cpf: client.cpf },
            create: client,
            update: client,
        });
    }

    console.info(`${SEED_CLIENTS.length} clientes de teste configurados`);
}

async function main() {
    await seedAdmin();
    await seedClients();
}

main()
    .catch((error: unknown) => {
        console.error('Falha ao executar o seed', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
