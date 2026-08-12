import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Button } from "#/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "#/components/ui/form";
import { Input } from "#/components/ui/input";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { useCreateEvent } from "#/http/hooks/useCreateEvent";
import { useDeleteEvent } from "#/http/hooks/useDeleteEvent";
import { useGetMe } from "#/http/hooks/useGetMe";
import { useUpdateEvent } from "#/http/hooks/useUpdateEvent";
import type { ListEventsStatus200 } from "#/http/types/ListEvents";
import { getApiErrorMessage } from "#/lib/api-error";

type EventListItem = ListEventsStatus200["data"][number];

const eventFormSchema = z.object({
	title: z.string().trim().min(1, "Informe o título"),
	description: z.string().trim(),
	startAt: z.string().trim().min(1, "Informe a data e hora"),
	reminderMinutesBefore: z.string().trim(),
	isGlobal: z.boolean(),
});

type EventFormInput = z.infer<typeof eventFormSchema>;

const toDateTimeLocalValue = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

type EventFormProps = {
	event?: EventListItem;
	defaultDate?: Date;
	onSuccess: () => void;
};

export const EventForm = ({
	event,
	defaultDate,
	onSuccess,
}: EventFormProps) => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useGetMe();

	const form = useForm<EventFormInput>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: event?.title ?? "",
			description: event?.description ?? "",
			startAt: event
				? toDateTimeLocalValue(new Date(event.startAt))
				: toDateTimeLocalValue(defaultDate ?? new Date()),
			reminderMinutesBefore: event?.reminderMinutesBefore
				? String(event.reminderMinutesBefore)
				: "",
			isGlobal: event?.isGlobal ?? false,
		},
	});

	const invalidateEvents = () => {
		queryClient.invalidateQueries({ queryKey: [{ url: "/events" }] });
	};

	const handleError = (error: unknown) => {
		toast.error(getApiErrorMessage(error, "Não foi possível salvar o evento"));
	};

	const { mutate: createEvent, isPending: isCreating } = useCreateEvent({
		mutation: {
			onSuccess: () => {
				invalidateEvents();
				toast.success("Evento criado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent({
		mutation: {
			onSuccess: () => {
				invalidateEvents();
				toast.success("Evento atualizado com sucesso");
				onSuccess();
			},
			onError: handleError,
		},
	});

	const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent({
		mutation: {
			onSuccess: () => {
				invalidateEvents();
				toast.success("Evento excluído com sucesso");
				onSuccess();
			},
			onError: (error) => {
				toast.error(
					getApiErrorMessage(error, "Não foi possível excluir o evento"),
				);
			},
		},
	});

	const isPending = isCreating || isUpdating;

	const onSubmit = (values: EventFormInput) => {
		const body = {
			title: values.title,
			description: values.description || undefined,
			startAt: new Date(values.startAt).toISOString(),
			reminderMinutesBefore: values.reminderMinutesBefore
				? Number(values.reminderMinutesBefore)
				: undefined,
			isGlobal: values.isGlobal,
		};

		if (event) {
			updateEvent({ path: { id: event.id }, body });
			return;
		}

		createEvent({ body });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Título</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição</FormLabel>
							<FormControl>
								<Textarea rows={3} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="startAt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Data e hora</FormLabel>
							<FormControl>
								<Input type="datetime-local" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="reminderMinutesBefore"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Avisar por e-mail (minutos antes)</FormLabel>
							<FormControl>
								<Input type="number" min={0} max={10080} {...field} />
							</FormControl>
							<FormDescription>
								Deixe em branco para não enviar lembrete por e-mail.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				{currentUser?.role === "ADMIN" ? (
					<FormField
						control={form.control}
						name="isGlobal"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-md border border-border px-3 py-2">
								<div className="flex flex-col gap-1">
									<FormLabel>Visível para todos</FormLabel>
									<FormDescription>
										Aparece destacado no calendário de todos os usuários.
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				) : null}

				<div className="mt-2 flex items-center gap-2">
					<Button type="submit" disabled={isPending} className="flex-1">
						{isPending ? "Salvando..." : "Salvar"}
					</Button>

					{event ? (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									type="button"
									variant="outline"
									disabled={isDeleting}
									aria-label="Excluir evento"
								>
									Excluir
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Excluir evento?</AlertDialogTitle>
									<AlertDialogDescription>
										Essa ação não pode ser desfeita. O evento será removido
										permanentemente.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancelar</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										disabled={isDeleting}
										onClick={() => deleteEvent({ path: { id: event.id } })}
									>
										{isDeleting ? "Excluindo..." : "Excluir"}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					) : null}
				</div>
			</form>
		</Form>
	);
};
