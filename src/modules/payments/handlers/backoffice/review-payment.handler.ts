import { RouteHandler } from 'fastify';
import { ReviewPaymentParams, ReviewPaymentBody } from '../../schemas';
import { reviewPayment } from '../../services';
import { handlePaymentError } from '../../errors';
import { emitShipmentUpdate } from '../../../shipment/notifications/emit-shipment-update';

interface Handler extends RouteHandler<{
    Params: ReviewPaymentParams;
    Body: ReviewPaymentBody
}> {}

export const reviewPaymentHandler: Handler = async (request, reply) => {
    try {
        const { userId, adminRole } = request.user;

        const { msg, data, shipmentNotification } = await reviewPayment(
            request.params.id,
            request.body,
            userId,
            adminRole
        );

        if (shipmentNotification) {
            emitShipmentUpdate(request.server.io, shipmentNotification.userId, {
                orderId: shipmentNotification.orderId,
                shipmentId: shipmentNotification.shipmentId,
                status: shipmentNotification.status,
            });
        }

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "revisar pago");
    }
};
