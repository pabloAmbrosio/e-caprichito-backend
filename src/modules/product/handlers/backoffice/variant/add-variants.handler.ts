import { RouteHandler } from "fastify";
import { addVariantsService } from "../../../services/backoffice/variant/add-variants.service";
import { handleProductError } from "../../../errors";
import { AddVariantsRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<AddVariantsRouteSpec> {}

export const addVariantsHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { id } = request.params;
        const { msg, data } = await addVariantsService(id, request.body, userId);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "agregar variantes");
    }
};
