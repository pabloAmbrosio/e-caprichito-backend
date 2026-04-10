import { FastifyInstance } from "fastify";
import { cancelOrderBackofficeHandler } from "../../handlers";
import { OrderIdInput, OrderIdSchema, CancelOrderBackofficeInput, CancelOrderBackofficeSchema } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IPatch {
  Params: OrderIdInput;
  Body: CancelOrderBackofficeInput;
}

const schema = {
  params: OrderIdSchema,
  body: CancelOrderBackofficeSchema,
};

export default (app: FastifyInstance) => {
  app.patch<IPatch>(
    `${ORDER_URL}/:orderId/cancel`,
    {
      preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])],
      schema,
    },
    cancelOrderBackofficeHandler
  );
};
