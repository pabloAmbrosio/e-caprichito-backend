import { FastifyInstance } from "fastify";
import { getLikedProductsHandler } from "../../../handlers/shop";
import { GetLikedProductsSchema } from "../../../schemas/get-liked-products.schema";
import { GetLikedProductsRouteSpec } from "../../../product-route-specs";
import { LIKED_PRODUCTS_URL } from "../../../constants";

const schema = { querystring: GetLikedProductsSchema };

export default (app: FastifyInstance) => {
    app.get<GetLikedProductsRouteSpec>(LIKED_PRODUCTS_URL, { preHandler: [app.authenticate], schema }, getLikedProductsHandler);
};
