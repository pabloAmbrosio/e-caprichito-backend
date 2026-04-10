import { FastifyReply, FastifyRequest } from 'fastify';
import { ProductErrorHandler } from './product.error';
import { Prisma } from '../../../lib/prisma';

export class PrismaProductErrorHandler implements ProductErrorHandler {
    handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return;

        request.log.error(error, `[product] Error de base de datos al ${context}. code=%s`, error.code);

        if (error.code === 'P2002') {
            return reply.status(409).send({
                error: 'DUPLICATE_ENTRY',
                message: 'Ya existe un registro con esos datos unicos'
            });
        }

        if (error.code === 'P2003') {
            return reply.status(409).send({
                error: 'FOREIGN_KEY_CONSTRAINT',
                message: 'No se puede eliminar porque tiene registros relacionados (ordenes, carrito)'
            });
        }

        if (error.code === 'P2025') {
            return reply.status(404).send({
                error: 'RELATED_NOT_FOUND',
                message: 'Registro relacionado no encontrado'
            });
        }

        return reply.status(500).send({
            error: 'DATABASE_ERROR',
            message: 'Error de base de datos'
        });
    }
}
