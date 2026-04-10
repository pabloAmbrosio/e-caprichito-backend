import { FastifyInstance } from "fastify";
import { addProductLikeHandler } from "../../../handlers/shop";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { AddProductLikeRouteSpec } from "../../../product-route-specs";
import { PRODUCT_LIKE_URL } from "../../../constants";

const schema = { params: ProductIdSchema };

export default (app: FastifyInstance) => {
    app.post<AddProductLikeRouteSpec>(PRODUCT_LIKE_URL, { preHandler: [app.authenticate], schema }, addProductLikeHandler);
};
