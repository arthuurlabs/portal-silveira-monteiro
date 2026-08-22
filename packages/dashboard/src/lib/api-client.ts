import { client } from '#/http/.kubb/client';

if (!import.meta.env.VITE_API_URL) {
    throw new Error(
        'VITE_API_URL não está definida. Sem ela, as requisições caem na própria origem do app em vez da API — configure a variável de ambiente antes do build.'
    );
}

export const apiBaseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');

client.setConfig({
    baseURL: apiBaseUrl,
    options: {
        withCredentials: true,
    },

    validateStatus: (status) => status >= 200 && status < 300,
});

export { client };

export default client;
