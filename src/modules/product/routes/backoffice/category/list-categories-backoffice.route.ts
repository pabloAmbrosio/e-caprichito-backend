import { FastifyInstance } from "fastify";
import { listCategoriesBackofficeHandler } from "../../../handlers/backoffice";
import { BO_CATEGORIES_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.get(BO_CATEGORIES_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])] }, listCategoriesBackofficeHandler);
};
