import { FastifyReply, FastifyRequest } from "fastify";
import { PromotionErrorHandler } from "./promotion.error-class";

export class DefaultPromotionErrorHandler implements PromotionErrorHandler {
  handle(error: unknown, reply: FastifyReply, request: FastifyRequest, context: string): FastifyReply | void {
    request.log.error(error, `Error interno: ${context}`);
    reply.status(500).send({
      success: false,
      msg: `Error interno al ${context}`,
      code: "INTERNAL_ERROR",
    });
  }
}
