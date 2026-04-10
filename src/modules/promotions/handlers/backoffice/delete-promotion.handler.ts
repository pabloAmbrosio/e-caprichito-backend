import { RouteHandler } from 'fastify';
import { deletePromotionService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { PromotionIdInput } from '../../schemas';

interface Handler extends RouteHandler<{ Params: PromotionIdInput }> {}

export const deletePromotionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await deletePromotionService(request.params.id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "eliminar promocion");
    }
};
