import { FastifyInstance } from "fastify";
import { paymentSignatureHandler } from "../handlers";
import { UPLOAD_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.post(
        `${UPLOAD_URL}/payment-signature`,
        {
            preHandler: [app.authenticate],
        },
        paymentSignatureHandler,
    );
};
