import { FastifyInstance, RouteGenericInterface } from "fastify";
import { listInventoryHandler } from "../../handlers";
import { ListInventoryQueryInput, ListInventoryQuerySchema } from "../../schemas";
import { INVENTORY_URL } from "../../constants";

interface IGet extends RouteGenericInterface {
    Querystring: ListInventoryQueryInput
}

const schema = {
    querystring: ListInventoryQuerySchema
}

export default (app: FastifyInstance) => {
    app.get<IGet>(
        INVENTORY_URL,
        {
            preHandler: [
                app.authenticate,
                app.requireRoles(["OWNER","ADMIN","MANAGER","SELLER"])
            ],
            schema
        },
        listInventoryHandler
    );
};
