import { FastifyInstance, RouteGenericInterface } from "fastify";
import { getInventoryHandler } from "../../handlers";
import { ProductIdParamInput, ProductIdParamSchema } from "../../schemas";
import { INVENTORY_URL } from "../../constants";

interface IGet extends RouteGenericInterface {
    Params: ProductIdParamInput
}

const schema = {
    params : ProductIdParamSchema
}

export default (app: FastifyInstance) => {
    app.get<IGet>(
        `${INVENTORY_URL}/:productId`,
        {
            preHandler: [
                app.authenticate,
                app.requireRoles(["OWNER","ADMIN","MANAGER","SELLER"])
            ],
            schema
        },
        getInventoryHandler
    );
};
