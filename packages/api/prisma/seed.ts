import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { db } from '../src/db/prisma.js';
import { UserRole } from '../src/generated/prisma/enums.js';
import type { TemplateContent } from '../src/http/routes/template-schemas.js';

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

const SEED_TEMPLATES: { name: string; description: string; title: string; content: TemplateContent }[] = [
    {
        name: 'Procuração',
        description: 'Outorga de poderes ao escritório para atuação judicial e extrajudicial',
        title: 'PROCURAÇÃO',
        content: {
            blocks: [
                { type: 'paragraph', text: '**OUTORGANTE:** {{client.qualification}}' },
                {
                    type: 'paragraph',
                    text: '**OUTORGADO:** Leandro da Silveira Monteiro, brasileiro, solteiro, advogado, inscrito na OAB/RJ sob o nº 99.210, e Diego Juliar da Silva, brasileiro, solteiro, advogado, inscrito na OAB/RJ sob o nº 242.392, com escritório na Rua Laureano Rosa, 100 – Alcântara – São Gonçalo – RJ.',
                },
                {
                    type: 'paragraph',
                    text: '**PODERES:** Pelo presente Instrumento Particular de Procuração, o outorgante nomeia e constitui como seus bastantes procuradores os outorgados, conferindo-lhes os poderes da cláusula ad judicia et extra, para o foro em geral, em qualquer Juízo, Instância ou Tribunal, especialmente para propor e acompanhar ações cíveis, podendo promover ações indenizatórias, apresentar petições, contestar, recorrer, produzir provas, participar de audiências, firmar acordos, receber citações, intimações e notificações, requerer justiça gratuita, levantar alvarás, receber valores e dar quitação, bem como praticar todos os demais atos necessários ao fiel cumprimento deste mandato, podendo ainda substabelecer com ou sem reserva de poderes.',
                },
                { type: 'paragraph', text: 'São Gonçalo/RJ, _____ de ____________________ de 20____.' },
                { type: 'signature-line', label: 'Assinatura do(a) cliente' },
            ],
        },
    },
    {
        name: 'Contrato de Honorários',
        description: 'Formalização da prestação de serviços e dos honorários advocatícios',
        title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS',
        content: {
            blocks: [
                { type: 'paragraph', text: '**CONTRATANTE:** {{client.qualification}}' },
                {
                    type: 'paragraph',
                    text: '**CONTRATADO:** Silveira Monteiro Sociedade Individual de Advocacia – CNPJ 68.049.484/0001-05, matrícula 183132026, com matriz na Avenida Ataulfo de Paiva, nº 1235, sala 303, Leblon Office Tower, Leblon, Rio de Janeiro/RJ, CEP 22440-034, com filial situada na Rua Laureano Rosa, nº 100, Alcântara, São Gonçalo/RJ, CEP 24710-350, neste ato representada por seu titular, Leandro da Silveira Monteiro, advogado inscrito na OAB/RJ sob o nº 99.210.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 1ª – DO OBJETO.** Prestação de serviços advocatícios para propositura, distribuição e acompanhamento de ação na área cível perante o Juizado Especial Cível ou Vara Cível competente.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 2ª – DOS HONORÁRIOS.** A título de entrada para distribuição e protocolo da ação, seria devido o valor de R$ 100,00 (cem reais). Contudo, nesta contratação, o escritório concede isenção integral desse valor, por liberalidade, não havendo cobrança da entrada.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 3ª – DOS HONORÁRIOS DE ÊXITO.** Em caso de procedência da ação, acordo judicial ou extrajudicial, cumprimento de sentença ou qualquer recebimento decorrente da demanda, a contratante pagará honorários de êxito de 30% (trinta por cento) sobre o valor bruto recebido.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 4ª – DAS DESPESAS PROCESSUAIS.** As despesas processuais e demais gastos necessários ao andamento da demanda serão de responsabilidade da contratante.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 5ª – DAS OBRIGAÇÕES DAS PARTES.** As partes comprometem-se a agir com boa-fé e fornecer todas as informações e documentos necessários ao andamento da demanda.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 6ª – DA RESCISÃO.** O contrato poderá ser rescindido por qualquer das partes, permanecendo devidos os honorários proporcionais aos serviços já prestados.',
                },
                {
                    type: 'paragraph',
                    text: '**CLÁUSULA 7ª – DO FORO.** Fica eleito o foro da Comarca de São Gonçalo/RJ para dirimir quaisquer controvérsias decorrentes deste contrato.',
                },
                { type: 'paragraph', text: 'São Gonçalo/RJ, ____ de ___________________ de ______.' },
                { type: 'paragraph', text: '**CONTRATANTE**' },
                { type: 'signature-line' },
                { type: 'paragraph', text: '{{client.fullName}}' },
                { type: 'paragraph', text: '**CONTRATADO**' },
                { type: 'signature-line' },
                {
                    type: 'paragraph',
                    text: 'Silveira Monteiro Advogados — Representada por Leandro da Silveira Monteiro — OAB/RJ 99.210',
                },
            ],
        },
    },
    {
        name: 'Substabelecimento',
        description: 'Transferência de poderes com reserva entre advogados do escritório',
        title: 'SUBSTABELECIMENTO COM RESERVA DE PODERES',
        content: {
            blocks: [
                {
                    type: 'paragraph',
                    text: '**OUTORGADO SUBSTABELECENTE:** Leandro da Silveira Monteiro, brasileiro, advogado, inscrito na OAB/RJ sob o nº 99.210.',
                },
                {
                    type: 'paragraph',
                    text: '**OUTORGADO SUBSTABELECIDO:** Diego Juliar da Silva, brasileiro, advogado, inscrito na OAB/RJ sob o nº 242.392.',
                },
                { type: 'paragraph', text: '**CLIENTE (OUTORGANTE ORIGINÁRIA):** {{client.qualification}}' },
                {
                    type: 'paragraph',
                    text: 'O advogado substabelecente, acima qualificado, substabelece, com reserva de poderes, ao advogado substabelecido, todos os poderes que lhe foram conferidos por meio da procuração outorgada pela cliente acima indicada, especialmente aqueles constantes da cláusula ad judicia et extra, para atuar em qualquer juízo, instância ou tribunal, podendo promover a defesa em processos judiciais e administrativos, apresentar peças processuais, interpor recursos, produzir provas, requerer medidas cabíveis, inclusive habeas corpus, e praticar todos os atos necessários ao fiel cumprimento do mandato.',
                },
                {
                    type: 'paragraph',
                    text: 'O presente substabelecimento é firmado com reserva de poderes, permanecendo o substabelecente com todos os poderes anteriormente conferidos.',
                },
                { type: 'paragraph', text: 'São Gonçalo, ____ de ___________________ de ______.' },
                { type: 'signature-line', label: 'Assinatura do substabelecente' },
            ],
        },
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

async function seedTemplates() {
    for (const template of SEED_TEMPLATES) {
        await db.template.upsert({
            where: { name: template.name },
            create: template,
            update: template,
        });
    }

    console.info(`${SEED_TEMPLATES.length} modelos de documento configurados`);
}

async function main() {
    await seedAdmin();
    await seedClients();
    await seedTemplates();
}

main()
    .catch((error: unknown) => {
        console.error('Falha ao executar o seed', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
