import { FastifyInstance } from "fastify";
import { validateCartHandler } from "../../../handlers";
import { CART_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get(`${CART_URL}/validate`, { preHandler: [app.authenticate] }, validateCartHandler);
};
