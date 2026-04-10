import { RouteHandler } from 'fastify';
import { removeActionService } from '../../services';
import { handlePromotionError } from '../../errors';

interface Handler extends RouteHandler<{ Params: { id: string; actionId: string } }> {}

export const removeActionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await removeActionService(request.params.id, request.params.actionId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "eliminar accion");
    }
};
