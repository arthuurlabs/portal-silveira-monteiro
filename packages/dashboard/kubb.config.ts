import { pluginAxios } from '@kubb/plugin-axios';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { defineConfig } from 'kubb/config';

export default defineConfig({
    input: 'http://localhost:3080/docs/json',

    output: {
        path: './src/http',
        clean: true,
    },

    plugins: [
        pluginTs({
            output: {
                path: 'types',
                mode: 'directory',
            },
        }),

        pluginAxios({
            output: {
                path: 'clients',
                mode: 'directory',
            },
        }),

        pluginReactQuery({
            output: {
                path: 'hooks',
                mode: 'directory',
            },

            hooks: true,
            suspense: false,
        }),

        pluginZod({
            output: {
                path: 'zod',
                mode: 'directory',
            },
        }),
    ],
});
