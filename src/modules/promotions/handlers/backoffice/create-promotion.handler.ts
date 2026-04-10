import { RouteHandler } from 'fastify';
import { createPromotionService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { CreatePromotionInput } from '../../schemas';

interface Handler extends RouteHandler<{ Body: CreatePromotionInput }> {}

export const createPromotionHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await createPromotionService(request.body);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "crear promocion");
    }
};
