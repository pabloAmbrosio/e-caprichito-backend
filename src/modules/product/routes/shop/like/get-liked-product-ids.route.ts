import { FastifyInstance } from "fastify";
import { getLikedProductIdsHandler } from "../../../handlers/shop";
import { GetLikedProductIdsRouteSpec } from "../../../product-route-specs";
import { LIKED_PRODUCT_IDS_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get<GetLikedProductIdsRouteSpec>(LIKED_PRODUCT_IDS_URL, { preHandler: [app.authenticate] }, getLikedProductIdsHandler);
};
