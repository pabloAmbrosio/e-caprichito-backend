import { FastifyInstance } from 'fastify';
import { db } from '../../../lib/prisma';

export const registerHealthCheck = (server: FastifyInstance) => {
    server.get('/health', async (_request, reply) => {

        let dbStatus: 'ok' | 'error' = 'ok';

        try {
            await db.$queryRawUnsafe('SELECT 1');
        } catch {
            dbStatus = 'error';
        }

        const memUsage = process.memoryUsage();

        return reply.send({
            status: dbStatus === 'ok' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            database: dbStatus,
            memory: {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
            },
        });
    });
};
