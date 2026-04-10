import { db } from "../../../lib/prisma";
import { messaging } from "../../../lib/messaging";

const STAFF_ROLES = ["OWNER", "ADMIN", "MANAGER", "SELLER"];

interface PaymentProofSMSPayload {
    orderId: string;
    amount: number;
}

export async function notifyStaffPaymentProofSMS(payload: PaymentProofSMSPayload) {
    try {
        const staffMembers = await db.user.findMany({
            where: {
                adminRole: { in: STAFF_ROLES as any },
                phone: { not: null },
                phoneVerified: true,
            },
            select: { phone: true },
        });

        if (staffMembers.length === 0) return;

        const amountFormatted = `$${(payload.amount / 100).toFixed(2)}`;
        const message =
            `[E-Caprichito] Nuevo comprobante de pago subido. ` +
            `Orden: ${payload.orderId.slice(0, 8)}... | Monto: ${amountFormatted}. ` +
            `Revisa en el backoffice.`;

        await Promise.allSettled(
            staffMembers.map((staff) =>
                messaging.send({ channel: 'sms', to: staff.phone!, message })
            )
        );
    } catch (error) {
        console.error("[NOTIFY-STAFF-SMS] Error al notificar staff:", error);
    }
}
