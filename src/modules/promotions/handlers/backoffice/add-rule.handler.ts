import { RouteHandler } from 'fastify';
import { addRuleService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { PromotionIdInput, CreateRuleInput } from '../../schemas';

interface Handler extends RouteHandler<{ Params: PromotionIdInput; Body: CreateRuleInput }> {}

export const addRuleHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await addRuleService(request.params.id, request.body);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "agregar regla");
    }
};
