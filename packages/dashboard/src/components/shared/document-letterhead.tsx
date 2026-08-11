import { OFFICE_INFO } from '#/lib/office-info';
import { cn } from '#/lib/utils';

type DocumentLetterheadProps = {
    className?: string;
};

/**
 * Timbre do documento — logo centralizado no topo de cada página.
 *
 * Este projeto não tem um arquivo de logo em `public/`, então o timbre reusa
 * o mesmo lockup ícone + nome já estabelecido na tela de login, em vez de uma
 * imagem.
 */
export const DocumentLetterhead = ({ className }: DocumentLetterheadProps) => (
    <div className={cn('flex shrink-0 items-center justify-center', className)}>
        <img
            src={OFFICE_INFO.logoPath}
            alt=""
            aria-hidden="true"
            className="h-full w-auto object-contain"
        />
    </div>
);
