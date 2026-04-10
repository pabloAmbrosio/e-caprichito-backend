import { FastifyInstance } from "fastify";
import { removeProductLikeHandler } from "../../../handlers/shop";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { RemoveProductLikeRouteSpec } from "../../../product-route-specs";
import { PRODUCT_LIKE_URL } from "../../../constants";

const schema = { params: ProductIdSchema };

export default (app: FastifyInstance) => {
    app.delete<RemoveProductLikeRouteSpec>(PRODUCT_LIKE_URL, { preHandler: [app.authenticate], schema }, removeProductLikeHandler);
};
