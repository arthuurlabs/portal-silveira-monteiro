import { createFileRoute } from '@tanstack/react-router';
import { FileQuestion, Loader2, Printer } from 'lucide-react';
import { useMemo } from 'react';

import { A4Document } from '#/components/shared/a4-document';
import { Button } from '#/components/ui/button';
import { useGetPublicPreview } from '#/http/hooks/useGetPublicPreview';

import { buildIntakeRecordItems, IntakeRecordTitle } from './-components/intake-record-sheet';

const PreviewRoute = () => {
    const { token } = Route.useParams();
    const { data, isPending, isError } = useGetPublicPreview({
        query: { token },
    });

    const items = useMemo(() => {
        if (!data || data.type !== 'intake') return [];
        return buildIntakeRecordItems({ intake: data.intake, client: data.client });
    }, [data]);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Carregando documento...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
                <FileQuestion className="size-8 text-muted-foreground/50" aria-hidden="true" />
                <div>
                    <p className="text-sm font-medium text-foreground">Documento não encontrado</p>
                    <p className="text-sm text-muted-foreground">
                        Este link é inválido ou expirou.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center gap-6 bg-muted/30 p-6 print:gap-0 print:bg-transparent print:p-0">
            <div className="flex w-full max-w-4xl items-center justify-between gap-4 print:hidden">
                <span className="font-display text-lg text-foreground">
                    Silveira &amp; Monteiro
                </span>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer />
                    Baixar
                </Button>
            </div>

            <div className="overflow-x-auto print:overflow-visible">
                <A4Document items={items} title={<IntakeRecordTitle />} />
            </div>
        </div>
    );
};

export const Route = createFileRoute('/preview/$token')({
    component: PreviewRoute,
    head: () => ({ meta: [{ title: 'Documento | Silveira & Monteiro' }] }),
});
