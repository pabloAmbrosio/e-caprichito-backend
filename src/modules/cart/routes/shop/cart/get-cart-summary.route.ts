import { FastifyInstance } from "fastify";
import { getCartSummaryHandler } from "../../../handlers";
import { CART_SUMMARY_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get(CART_SUMMARY_URL, {preHandler: [app.authenticate]}, getCartSummaryHandler);
};
