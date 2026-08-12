import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEMPLATES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../templates');

export const renderEmailTemplate = (fileName: string, variables: Record<string, string>) => {
    const template = readFileSync(path.join(TEMPLATES_DIR, fileName), 'utf-8');

    return Object.entries(variables).reduce(
        (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
        template
    );
};
