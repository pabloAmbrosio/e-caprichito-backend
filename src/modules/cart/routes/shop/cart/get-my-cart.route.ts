import { FastifyInstance } from "fastify";
import { getMyCartHandler } from "../../../handlers";
import { CART_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get(CART_URL, {preHandler: [app.authenticate]}, getMyCartHandler);
};
