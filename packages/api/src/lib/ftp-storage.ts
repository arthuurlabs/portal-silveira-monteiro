import type { Readable, Writable } from 'node:stream';

import { Client } from 'basic-ftp';

import { env } from '../env.js';

const withFtpClient = async <T>(fn: (client: Client) => Promise<T>): Promise<T> => {
    const client = new Client();

    try {
        await client.access({
            host: env.FTP_HOST,
            port: env.FTP_PORT,
            user: env.FTP_USER,
            password: env.FTP_PASSWORD,
            secure: env.FTP_SECURE,
        });

        return await fn(client);
    } finally {
        client.close();
    }
};

export const uploadToFtp = (remotePath: string, stream: Readable) =>
    withFtpClient(async (client) => {
        const remoteDir = remotePath.slice(0, remotePath.lastIndexOf('/'));

        await client.ensureDir(remoteDir);
        await client.uploadFrom(stream, remotePath);
    });

export const downloadFromFtp = (remotePath: string, destination: Writable) =>
    withFtpClient((client) => client.downloadTo(destination, remotePath));

export const deleteFromFtp = (remotePath: string) =>
    withFtpClient(async (client) => {
        try {
            await client.remove(remotePath);
        } catch {
            // Arquivo já removido do FTP: exclusão idempotente, nada a fazer.
        }
    });
