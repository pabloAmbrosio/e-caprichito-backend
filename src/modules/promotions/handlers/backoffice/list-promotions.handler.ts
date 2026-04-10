import { RouteHandler } from 'fastify';
import { listPromotionsService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { ListPromotionsInput } from '../../schemas';

interface Handler extends RouteHandler<{ Querystring: ListPromotionsInput }> {}

export const listPromotionsHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await listPromotionsService(request.query);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "listar promociones");
    }
};
