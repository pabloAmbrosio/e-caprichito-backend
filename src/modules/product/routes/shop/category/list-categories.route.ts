import { FastifyInstance } from "fastify";
import { listCategoriesHandler } from "../../../handlers/shop";
import { CATEGORIES_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get(CATEGORIES_URL, listCategoriesHandler);
};
