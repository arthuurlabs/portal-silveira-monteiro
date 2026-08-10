module.exports = {
    apps: [
        {
            name: 'portalsm-api',
            cwd: __dirname,
            script: 'dist/http/server.js',
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            kill_timeout: 5000,
        },
    ],
};
