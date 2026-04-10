import { FastifyInstance } from "fastify";
import { CART_URL } from "../../../constants";
import { deleteCartHandler } from "../../../handlers";

export default (app: FastifyInstance) => {
    app.delete(
        `${CART_URL}`,
        {preHandler: [app.authenticate]},
        deleteCartHandler
    );
}
