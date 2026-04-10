import { RouteHandler } from "fastify";
import { generateUploadSignatureService } from "../services";

export const paymentSignatureHandler: RouteHandler = async (_request, reply) => {
    const { msg, data } = generateUploadSignatureService("payments");
    return reply.send({ success: true, msg, data });
};
