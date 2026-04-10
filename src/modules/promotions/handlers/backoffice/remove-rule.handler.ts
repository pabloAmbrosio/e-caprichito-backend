import { RouteHandler } from 'fastify';
import { removeRuleService } from '../../services';
import { handlePromotionError } from '../../errors';

interface Handler extends RouteHandler<{ Params: { id: string; ruleId: string } }> {}

export const removeRuleHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await removeRuleService(request.params.id, request.params.ruleId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "eliminar regla");
    }
};
