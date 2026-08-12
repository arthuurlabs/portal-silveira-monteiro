import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	notFound,
	Outlet,
	useMatchRoute,
	useNavigate,
} from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { Badge } from "#/components/ui/badge";
import { Button, buttonVariants } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { ResponseError } from "#/http/.kubb/client";
import { useDeleteCompany } from "#/http/hooks/useDeleteCompany";
import {
	getCompanyQueryOptions,
	useGetCompany,
} from "#/http/hooks/useGetCompany";
import { getApiErrorMessage } from "#/lib/api-error";

import { CompanyUpsertDialog } from "../-components/company-upsert-dialog";
import { CompanySwitcher } from "./-components/company-switcher";

const COMPANY_TABS = [
	{
		value: "overview",
		label: "Visão geral",
		to: "/clients/$client_id/companies/$company_id",
	},
	{
		value: "files",
		label: "Arquivos",
		to: "/clients/$client_id/companies/$company_id/files",
	},
] as const;

const CompanyLayout = () => {
	const { client } = Route.useRouteContext();
	const { company_id } = Route.useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const matchRoute = useMatchRoute();

	const { data: company } = useGetCompany({ path: { id: company_id } });

	const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: [{ url: "/clients/:clientId/companies" }],
				});
				toast.success("Empresa excluída com sucesso");
				navigate({
					to: "/clients/$client_id",
					params: { client_id: client.id },
				});
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir a empresa"),
				);
			},
		},
	});

	if (!company) {
		return null;
	}

	const activeTab =
		COMPANY_TABS.find((tab) =>
			matchRoute({
				to: tab.to,
				params: { client_id: client.id, company_id: company.id },
				fuzzy: false,
			}),
		)?.value ?? "overview";

	return (
		<div className="flex flex-col gap-6">
			<Link
				to="/clients/$client_id"
				params={{ client_id: client.id }}
				className="w-fit text-sm text-muted-foreground hover:text-foreground print:hidden"
			>
				← Voltar para {client.fullName}
			</Link>

			<div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-2">
					<p className="sm-eyebrow">Empresa</p>
					<h1 className="sm-display text-3xl md:text-4xl">
						{company.razaoSocial}
					</h1>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>{company.cnpj}</span>
						<Badge variant={company.isActive ? "success" : "neutral"}>
							{company.isActive ? "Ativa" : "Inativa"}
						</Badge>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<CompanySwitcher clientId={client.id} currentCompanyId={company.id} />

					<CompanyUpsertDialog clientId={client.id} company={company}>
						<Button variant="outline">
							<Pencil />
							Editar
						</Button>
					</CompanyUpsertDialog>

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline">
								<Trash2 />
								Excluir
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
								<AlertDialogDescription>
									Essa ação não pode ser desfeita. A empresa será removida
									permanentemente.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									disabled={isDeleting}
									onClick={() => deleteCompany({ path: { id: company.id } })}
								>
									{isDeleting ? "Excluindo..." : "Excluir"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>

			<Tabs value={activeTab} className="print:hidden">
				<TabsList>
					{COMPANY_TABS.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value} asChild>
							<Link
								to={tab.to}
								params={{ client_id: client.id, company_id: company.id }}
							>
								{tab.label}
							</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<Outlet />
		</div>
	);
};

const CompanyNotFound = () => {
	return (
		<div className="flex flex-col items-center gap-3 py-16 text-center">
			<p className="text-lg font-medium text-foreground">
				Empresa não encontrada
			</p>
			<p className="text-sm text-muted-foreground">
				A empresa que você está procurando não existe ou foi removida.
			</p>
			<Link
				to="/clients"
				className={buttonVariants({ variant: "outline", className: "mt-2" })}
			>
				Voltar para clientes
			</Link>
		</div>
	);
};

export const Route = createFileRoute(
	"/_app/clients/$client_id/companies/$company_id",
)({
	beforeLoad: async ({ context, params }) => {
		try {
			const company = await context.queryClient.ensureQueryData({
				...getCompanyQueryOptions({ path: { id: params.company_id } }),
				retry: false,
			});

			if (company.legalRepresentativeId !== params.client_id) {
				throw notFound();
			}

			return { company };
		} catch (error) {
			if (error instanceof ResponseError && error.status === 404) {
				throw notFound();
			}
			throw error;
		}
	},
	component: CompanyLayout,
	notFoundComponent: CompanyNotFound,
});
