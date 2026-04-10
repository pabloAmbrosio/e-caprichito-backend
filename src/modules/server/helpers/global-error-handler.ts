import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../../../config';

const isProduction = env.NODE_ENV === 'production';

export const globalErrorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error({ err: error }, 'Error no manejado');

    const statusCode = error.statusCode || 500;

    if (isProduction && statusCode >= 500) {
        return reply.status(statusCode).send({
            success: false,
            error: 'Error interno del servidor',
            code: 'INTERNAL_SERVER_ERROR',
        });
    }

    return reply.status(statusCode).send({
        success: false,
        error: error.message,
        ...(isProduction ? {} : { stack: error.stack, code: error.code }),
    });
};
