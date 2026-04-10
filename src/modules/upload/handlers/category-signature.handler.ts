import { RouteHandler } from "fastify";
import { generateUploadSignatureService } from "../services";

export const categorySignatureHandler: RouteHandler = async (_request, reply) => {
    const { msg, data } = generateUploadSignatureService("categories");
    return reply.send({ success: true, msg, data });
};
