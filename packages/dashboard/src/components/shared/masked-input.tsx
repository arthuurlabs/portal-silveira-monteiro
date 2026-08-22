import { IMaskInput } from "react-imask";

import { CNPJ_MASK, CPF_MASK, PHONE_MASK, RG_MASK } from "#/lib/masks";
import { cn } from "#/lib/utils";

const inputClassName =
	"h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15";

type MaskedFieldProps = {
	id?: string;
	className?: string;
	value: string;
	onAccept: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	autoComplete?: string;
	"aria-invalid"?: boolean;
};

/** RG não possui um formato nacional único — usamos uma máscara razoável (padrão SSP-SP), que pode não caber RGs de outros estados. */
export const RgInput = ({ className, ...props }: MaskedFieldProps) => (
	<IMaskInput
		mask={RG_MASK}
		className={cn(inputClassName, className)}
		// biome-ignore lint/suspicious/noExplicitAny: react-imask's generic mask prop typing doesn't narrow cleanly across mask kinds
		{...(props as any)}
	/>
);

export const CpfInput = ({ className, ...props }: MaskedFieldProps) => (
	<IMaskInput
		mask={CPF_MASK}
		className={cn(inputClassName, className)}
		// biome-ignore lint/suspicious/noExplicitAny: react-imask's generic mask prop typing doesn't narrow cleanly across mask kinds
		{...(props as any)}
	/>
);

export const CnpjInput = ({ className, ...props }: MaskedFieldProps) => (
	<IMaskInput
		mask={CNPJ_MASK}
		className={cn(inputClassName, className)}
		// biome-ignore lint/suspicious/noExplicitAny: react-imask's generic mask prop typing doesn't narrow cleanly across mask kinds
		{...(props as any)}
	/>
);

export const PhoneInput = ({ className, ...props }: MaskedFieldProps) => (
	<IMaskInput
		mask={PHONE_MASK}
		className={cn(inputClassName, className)}
		// biome-ignore lint/suspicious/noExplicitAny: react-imask's generic mask prop typing doesn't narrow cleanly across mask kinds
		{...(props as any)}
	/>
);
