import { client } from '#/http/.kubb/client';

client.setConfig({
    baseURL: import.meta.env.VITE_API_URL,
    options: {
        withCredentials: true,
    },
});

export { client };

export default client;
