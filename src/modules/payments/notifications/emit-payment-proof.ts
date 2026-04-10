import type { Server } from "socket.io";

interface PaymentProofNotification {
    paymentId: string;
    orderId: string;
    customerId: string;
    amount: number;
}

export function emitPaymentProofUploaded(io: Server, payload: PaymentProofNotification) {
    io.to("staff").emit("payment:proof-uploaded", payload);
}
