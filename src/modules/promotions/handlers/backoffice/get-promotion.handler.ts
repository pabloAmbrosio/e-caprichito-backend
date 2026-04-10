import { RouteHandler } from 'fastify';
import { getPromotionService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { PromotionIdInput } from '../../schemas';

interface Handler extends RouteHandler<{ Params: PromotionIdInput }> {}

export const getPromotionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await getPromotionService(request.params.id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "obtener promocion");
    }
};
