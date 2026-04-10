import { RouteHandler } from "fastify";
import { autocompleteService } from "../../../services/shop/product/autocomplete.service";
import { handleProductError } from "../../../errors";
import { AutocompleteRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<AutocompleteRouteSpec> {}

export const autocompleteHandler: Handler = async (request, reply) => {
  try {
    const { q, limit } = request.query;
    const { msg, data } = await autocompleteService(q, limit);
    return reply.send({ success: true, msg, data });
  } catch (error) {
    return handleProductError(error, reply, request, "autocompletar productos");
  }
};
