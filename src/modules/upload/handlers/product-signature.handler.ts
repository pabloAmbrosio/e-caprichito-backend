import { RouteHandler } from "fastify";
import { generateUploadSignatureService } from "../services";

export const productSignatureHandler: RouteHandler = async (_request, reply) => {
    const { msg, data } = generateUploadSignatureService("products");
    return reply.send({ success: true, msg, data });
};
