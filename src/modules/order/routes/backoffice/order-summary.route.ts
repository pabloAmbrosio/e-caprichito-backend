import { FastifyInstance } from "fastify";
import { getOrderSummaryHandler } from "../../handlers";
import { OrderSummarySchema, OrderSummaryInput } from "../../schemas";
import { ORDER_URL } from "../../constants";

interface IGet {
  Querystring: OrderSummaryInput;
}

const schema = { querystring: OrderSummarySchema };

export default (app: FastifyInstance) => {
  app.get<IGet>(
    `${ORDER_URL}/summary`,
    {
      preHandler: [
        app.authenticate,
        app.requireRoles(["OWNER", "ADMIN"]),
      ],
      schema,
    },
    getOrderSummaryHandler,
  );
};
