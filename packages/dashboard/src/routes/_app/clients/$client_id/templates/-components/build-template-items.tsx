import type { A4Item } from "#/components/shared/a4-document";
import type { GetClientStatus200 } from "#/http/types/GetClient";
import type { GetTemplateStatus200 } from "#/http/types/GetTemplate";

import { buildClientQualification } from "../-utils/build-client-qualification";
import { TemplateSignatureLine } from "./template-signature-line";

const TOKEN_PATTERN = /\{\{(.*?)\}\}/g;
const BOLD_PATTERN = /\*\*(.*?)\*\*/g;

const resolveToken = (token: string, client: GetClientStatus200) => {
	if (token === "client.qualification") return buildClientQualification(client);
	if (token === "client.fullName") return client.fullName;
	return `{{${token}}}`;
};

/** Texto literal do modelo pode marcar rótulos em negrito com `**assim**`, igual ao PDF de referência. */
const renderPlainSegment = (segment: string, keyPrefix: string) =>
	segment.split(BOLD_PATTERN).map((part, index) =>
		index % 2 === 1 ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: texto estático por bloco, a ordem dos segmentos não muda entre renders
			<strong key={`${keyPrefix}-${index}`}>{part}</strong>
		) : (
			part
		),
	);

const renderTemplateText = (text: string, client: GetClientStatus200) =>
	text
		.split(TOKEN_PATTERN)
		.flatMap((part, index) =>
			index % 2 === 1
				? [resolveToken(part, client)]
				: renderPlainSegment(part, `t${index}`),
		);

export const buildTemplateItems = (
	template: GetTemplateStatus200,
	client: GetClientStatus200,
): A4Item[] =>
	template.content.blocks.map((block, index) => ({
		id: `${block.type}-${index}`,
		breakBefore: block.breakBefore,
		node:
			block.type === "signature-line" ? (
				<TemplateSignatureLine label={block.label} />
			) : (
				<p className="text-justify">{renderTemplateText(block.text, client)}</p>
			),
	}));
