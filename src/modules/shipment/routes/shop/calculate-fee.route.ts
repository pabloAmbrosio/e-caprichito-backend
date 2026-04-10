import { FastifyInstance } from "fastify";
import { calculateFeeHandler } from "../../handlers";
import { CalculateFeeBody, CalculateFeeSchema } from "../../schemas";
import { SHIPMENT_URL } from "../../constants";

const schema = { body: CalculateFeeSchema };

export default (app: FastifyInstance) => {
    app.post<{ Body: CalculateFeeBody }>(
        `${SHIPMENT_URL}/calculate-fee`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        calculateFeeHandler,
    );
};
