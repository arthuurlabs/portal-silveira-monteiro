import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '#/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#/components/ui/form';
import { Input } from '#/components/ui/input';
import { useSignIn } from '#/http/hooks/useSignIn';
import { getApiErrorMessage } from '#/lib/api-error';

const loginSchema = z.object({
    email: z.email('Informe um email válido'),
    password: z.string().min(1, 'Informe a senha'),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
    const navigate = useNavigate();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const { mutate, isPending } = useSignIn({
        mutation: {
            onSuccess: () => {
                navigate({ to: '/', replace: true });
            },
            onError: (error) => {
                toast.error(
                    getApiErrorMessage(error, 'Verifique suas credenciais e tente novamente.')
                );
            },
        },
    });

    const onSubmit = (values: LoginInput) => {
        mutate({ body: values });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                htmlFor="email"
                                className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
                            >
                                Email
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-invalid={Boolean(form.formState.errors.email)}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                htmlFor="password"
                                className="text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
                            >
                                Senha
                            </FormLabel>
                            <FormControl>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={Boolean(form.formState.errors.password)}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="mt-2 w-full">
                    {isPending ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>
        </Form>
    );
}
