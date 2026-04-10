import * as v from 'valibot';
import { ExpiredOrderDataSchema } from '../schemas/expired-order.schema';
import { ExpiredOrderData } from '../registry/expiration-handler.interface';

export const validateExpiredOrder = (order: ExpiredOrderData): { success: true } | { success: false; errors: string[] } => {
    const validation = v.safeParse(ExpiredOrderDataSchema, order);

    if (!validation.success) {
        const errors = validation.issues.map((issue) => issue.message);
        console.error(
            `[OrderExpiration] Datos invalidos para orden ${order.id}:`,
            JSON.stringify({
                orderId: order.id,
                errors,
                timestamp: new Date().toISOString(),
            })
        );
        return { success: false, errors };
    }

    return { success: true };
};
