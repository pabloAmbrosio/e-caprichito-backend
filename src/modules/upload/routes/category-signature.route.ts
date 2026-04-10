import { FastifyInstance } from "fastify";
import { categorySignatureHandler } from "../handlers";
import { UPLOAD_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${UPLOAD_URL}/category-signature`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
        },
        categorySignatureHandler,
    );
};
