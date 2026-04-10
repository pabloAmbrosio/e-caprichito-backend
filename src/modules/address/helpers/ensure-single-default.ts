import type { DbClientOrTx } from "../../../lib/prisma";
export async function ensureSingleDefault(db: DbClientOrTx, userId: string, excludeId?: string) {
    await (db as any).address.updateMany({
        where: {
            userId,
            isDefault: true,
            deletedAt: null,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        data: { isDefault: false },
    });
}
