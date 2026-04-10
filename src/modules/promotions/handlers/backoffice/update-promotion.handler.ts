import { RouteHandler } from 'fastify';
import { updatePromotionService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { PromotionIdInput, UpdatePromotionInput } from '../../schemas';

interface Handler extends RouteHandler<{ Params: PromotionIdInput; Body: UpdatePromotionInput }> {}

export const updatePromotionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await updatePromotionService(request.params.id, request.body);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "actualizar promocion");
    }
};
