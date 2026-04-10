import type { DbClientOrTx } from "../../../lib/prisma";
export async function hasActiveShipment(db: DbClientOrTx, addressId: string): Promise<boolean> {
    const count = await (db as any).shipment.count({
        where: { addressId, status: { notIn: ["DELIVERED", "FAILED"] } },
    });
    return count > 0;
}
