import { FastifyInstance, RouteGenericInterface } from "fastify";
import { reserveStockHandler } from "../../handlers";
import { StockOperationInput, StockOperationSchema } from "../../schemas";
import { INVENTORY_URL } from "../../constants";

interface IPost extends RouteGenericInterface {
    Body: StockOperationInput
}

const schema = {
    body: StockOperationSchema
}

const config = {
    rateLimit: {
        max: parseInt(process.env.INVENTORY_RATE_LIMIT_MAX || '30'),
        timeWindow: parseInt(process.env.INVENTORY_RATE_LIMIT_WINDOW || '60000')
    }
}

export default (app: FastifyInstance) => {
    app.post<IPost>(
        `${INVENTORY_URL}/reserve`,
        {
            preHandler: [
                app.authenticate,
                app.requireRoles(["OWNER","ADMIN","MANAGER","SELLER"])
            ],
            schema,
            config
        },
        reserveStockHandler
    );
};
