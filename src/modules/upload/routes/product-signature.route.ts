import { FastifyInstance } from "fastify";
import { productSignatureHandler } from "../handlers";
import { UPLOAD_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${UPLOAD_URL}/product-signature`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
        },
        productSignatureHandler,
    );
};
