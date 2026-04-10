import { FastifyInstance } from "fastify";
import { promotionSignatureHandler } from "../handlers";
import { UPLOAD_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${UPLOAD_URL}/promotion-signature`,
        {
            preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
        },
        promotionSignatureHandler,
    );
};
