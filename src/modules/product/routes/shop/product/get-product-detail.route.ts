import { FastifyInstance } from "fastify";
import { getProductDetailHandler } from "../../../handlers/shop";
import { ProductIdOrSlugSchema } from "../../../schemas/product-params.schema";
import { GetProductDetailRouteSpec } from "../../../product-route-specs";
import { PRODUCT_DETAIL_URL } from "../../../constants";

const schema = { params: ProductIdOrSlugSchema };

export default (app: FastifyInstance) => {
    app.get<GetProductDetailRouteSpec>(PRODUCT_DETAIL_URL, { schema }, getProductDetailHandler);
};
