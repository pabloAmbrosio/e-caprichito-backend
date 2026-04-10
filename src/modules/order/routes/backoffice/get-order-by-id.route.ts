import { FastifyInstance } from "fastify";
import { getOrderByIdHandler } from "../../handlers";
import { OrderIdInput, OrderIdSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IGet { Params: OrderIdInput }
const schema = { params: OrderIdSchema };


export default (app: FastifyInstance) => {
    app.get<IGet>(
        `${ORDER_URL}/:orderId`,
        {
            preHandler: [
                app.authenticate,
                app.requireRoles(["OWNER", "ADMIN", "MANAGER", "SELLER"]),
            ],
            schema,
        },
        getOrderByIdHandler
    );
};
