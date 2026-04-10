import { FastifyInstance } from "fastify";
import { listProductsHandler } from "../../../handlers/shop";
import { ListProductsSchema } from "../../../schemas/list-products.schema";
import { ListProductsRouteSpec } from "../../../product-route-specs";
import { PRODUCTS_URL } from "../../../constants";

const schema = { querystring: ListProductsSchema };

export default (app: FastifyInstance) => {
    app.get<ListProductsRouteSpec>(PRODUCTS_URL, { schema, preHandler: [app.authenticateOptional] }, listProductsHandler);
};
