import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { Upload } from 'lucide-react';

import { Button } from '#/components/ui/button';
import { useListDocuments } from '#/http/hooks/useListDocuments';

import { DocumentList } from '../-components/document-list';
import { DocumentUploadDialog } from '../-components/document-upload-dialog';

const clientRoute = getRouteApi('/_app/clients/$client_id');

const ClientFilesRoute = () => {
    const { client } = clientRoute.useLoaderData();

    const { data, isPending, isError } = useListDocuments({
        path: { clientId: client.id },
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                    <p className="sm-eyebrow">Arquivos</p>
                    <h1 className="sm-display text-3xl md:text-4xl">Arquivos</h1>
                    <div className="sm-rule" />
                </div>

                <DocumentUploadDialog clientId={client.id}>
                    <Button>
                        <Upload />
                        Enviar documento
                    </Button>
                </DocumentUploadDialog>
            </div>

            <DocumentList
                clientId={client.id}
                documents={data?.data}
                isPending={isPending}
                isError={isError}
            />
        </div>
    );
};

export const Route = createFileRoute('/_app/clients/$client_id/files/')({
    component: ClientFilesRoute,
    head: () => ({
        meta: [{ title: 'Arquivos | Silveira & Monteiro' }],
    }),
});
