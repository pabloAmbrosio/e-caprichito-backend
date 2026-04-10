import { FastifyInstance } from "fastify";
import { initializeProductHandler } from "../../../handlers/backoffice";
import { InitializeProductSchema } from "../../../schemas/initialize-product.schema";
import { InitializeProductRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCTS_URL } from "../../../constants";

const schema = { body: InitializeProductSchema };

export default (app: FastifyInstance) => {
    app.post<InitializeProductRouteSpec>(
        BO_PRODUCTS_URL,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
            schema,
        },
        initializeProductHandler
    );
};
