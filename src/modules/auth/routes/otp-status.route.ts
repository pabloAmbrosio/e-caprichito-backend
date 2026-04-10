import { FastifyInstance } from "fastify";
import { otpStatusHandler } from "../handlers";
import { AUTH_URL } from "../constants";

export default (app: FastifyInstance) => {
    app.get(
        `${AUTH_URL}/otp-status`,
        {
            preHandler: [app.authenticate],
        },
        otpStatusHandler,
    );
};
