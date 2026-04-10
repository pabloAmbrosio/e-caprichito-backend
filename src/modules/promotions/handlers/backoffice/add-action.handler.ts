import { RouteHandler } from 'fastify';
import { addActionService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { PromotionIdInput, CreateActionInput } from '../../schemas';

interface Handler extends RouteHandler<{ Params: PromotionIdInput; Body: CreateActionInput }> {}

export const addActionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await addActionService(request.params.id, request.body);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "agregar accion");
    }
};
