import type { DbClientOrTx } from "../../../lib/prisma";
export async function reassignDefault(db: DbClientOrTx, userId: string) {
    const newest = await (db as any).address.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true },
    });

    if (newest) {
        await (db as any).address.update({
            where: { id: newest.id },
            data: { isDefault: true },
        });
    }
}
