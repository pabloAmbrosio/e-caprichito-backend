import { RouteHandler } from 'fastify';
import { UploadProofParams, UploadProofBody } from '../../schemas';
import { uploadProof } from '../../services';
import { handlePaymentError } from '../../errors';
import { emitPaymentProofUploaded, notifyStaffPaymentProofSMS } from '../../notifications';

interface Handler extends RouteHandler<{
    Params: UploadProofParams;
    Body: UploadProofBody
}> {}

export const uploadProofHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await uploadProof(request.params.id, request.body, userId);

        emitPaymentProofUploaded(request.server.io, {
            paymentId: data!.id,
            orderId: data!.orderId,
            customerId: userId,
            amount: data!.amount,
        });

        notifyStaffPaymentProofSMS({
            orderId: data!.orderId,
            amount: data!.amount,
        });

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePaymentError(error, reply, request, "subir comprobante");
    }
};
