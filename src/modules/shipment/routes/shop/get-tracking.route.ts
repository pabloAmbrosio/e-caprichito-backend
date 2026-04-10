import { FastifyInstance } from "fastify";
import { getTrackingHandler } from "../../handlers";
import { TrackingOrderIdInput, TrackingOrderIdSchema } from "../../schemas";
import { SHIPMENT_URL } from "../../constants";

const schema = { params: TrackingOrderIdSchema };

export default (app: FastifyInstance) => {
    app.get<{ Params: TrackingOrderIdInput }>(
        `${SHIPMENT_URL}/:orderId/tracking`,
        {
            preHandler: [app.authenticate],
            schema,
        },
        getTrackingHandler,
    );
};
