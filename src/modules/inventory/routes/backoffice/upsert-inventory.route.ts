import { FastifyInstance, RouteGenericInterface } from "fastify";
import { upsertInventoryHandler } from "../../handlers";
import { CreateInventoryInput, CreateInventorySchema } from "../../schemas";
import { INVENTORY_URL } from "../../constants";

interface IPost extends RouteGenericInterface {
    Body : CreateInventoryInput
}

const schema = {
    body : CreateInventorySchema
}

const config = {
    rateLimit: {
        max: parseInt(process.env.INVENTORY_RATE_LIMIT_MAX || '30'),
        timeWindow: parseInt(process.env.INVENTORY_RATE_LIMIT_WINDOW || '60000')
    }
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        INVENTORY_URL,
        {
            preHandler: [
                app.authenticate,
                app.requireRoles(["OWNER","ADMIN","MANAGER"])
            ],
            schema,
            config
        },
        upsertInventoryHandler
    );
};
