import { RouteHandler } from "fastify";
import { generateUploadSignatureService } from "../services";

export const promotionSignatureHandler: RouteHandler = async (_request, reply) => {
    const { msg, data } = generateUploadSignatureService("promotions");
    return reply.send({ success: true, msg, data });
};
