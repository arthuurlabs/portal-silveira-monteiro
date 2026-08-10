import jwt from '@fastify/jwt';

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { db } from '../../db/prisma.js';
import { env } from '../../env.js';
import { UserRole } from '../../generated/prisma/enums.js';
import { ForbiddenError } from '../_errors/forbidden.js';
import { UnauthorizedError } from '../_errors/unauthorized.js';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload:
            { sub: string } | { clientId: string; templateId: string; purpose: 'document-share' };
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
            active: boolean;
        };
    }
}

declare module 'fastify' {
    interface FastifyRequest {
        authenticate: () => Promise<void>;
        shouldBeAdmin: () => Promise<void>;
    }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
    await app.register(jwt, {
        secret: env.JWT_SECRET,
        cookie: { cookieName: 'token', signed: false },
        sign: { expiresIn: '7d' },
        verify: { onlyCookie: true },
    });

    app.decorateRequest('authenticate', async function authenticate() {
        let payload: { sub: string };

        try {
            payload = await this.jwtVerify<{ sub: string }>();
        } catch {
            throw new UnauthorizedError();
        }

        const user = await db.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, name: true, email: true, role: true, active: true },
        });

        if (!user || !user.active) throw new UnauthorizedError();

        this.user = user;
    });

    app.decorateRequest('shouldBeAdmin', async function shouldBeAdmin() {
        if (this.user.role !== 'ADMIN') throw new ForbiddenError();
    });
});
