import 'dotenv/config';

import bcrypt from 'bcryptjs';

import { db } from '../src/db/prisma.js';
import { UserRole } from '../src/generated/prisma/enums.js';
import type { TemplateContent } from '../src/http/routes/template-schemas.js';

const ADMIN_EMAIL = 'admin@portalsilveiramonteiro.com.br';
const ADMIN_NAME = 'Admin';

const SEED_TEMPLATES: {
    name: string;
    description: string;
    title: string;
    content: TemplateContent;
}[] = [
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
                {
                    type: 'paragraph',
                    text: 'São Gonçalo/RJ, _____ de ____________________ de 20____.',
                },
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
                {
                    type: 'paragraph',
                    text: 'São Gonçalo/RJ, ____ de ___________________ de ______.',
                },
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
                {
                    type: 'paragraph',
                    text: '**CLIENTE (OUTORGANTE ORIGINÁRIA):** {{client.qualification}}',
                },
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
    const password = process.env.DEFAULT_USER_PASSWORD;

    if (!password || password.length < 12) {
        throw new Error('DEFAULT_USER_PASSWORD deve possuir pelo menos 12 caracteres');
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
