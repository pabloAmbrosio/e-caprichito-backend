import { db } from '../../../lib/prisma';
import { formatError } from './format-error';

export const revertOrderToPending = async (orderId: string): Promise<void> => {
    try {
        await db.order.update({
            where: { id: orderId },
            data: { status: 'PENDING' },
        });
        console.info(
            `[OrderExpiration] Orden ${orderId} marcada para reprocesamiento en proxima ejecucion`
        );
    } catch (retryError: unknown) {
        const { message } = formatError(retryError);
        console.error(
            `[OrderExpiration] Error al marcar orden ${orderId} para reprocesamiento:`,
            JSON.stringify({
                orderId,
                error: message,
                timestamp: new Date().toISOString(),
            })
        );
    }
};
