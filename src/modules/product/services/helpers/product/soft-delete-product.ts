import { db } from '../../../../../lib/prisma';

export const softDeleteProduct = async (id: string): Promise<void> => {
  const now = new Date();

  await db.$transaction([
    db.abstractProduct.update({
      where: { id },
      data: { deletedAt: now },
    }),
    db.product.updateMany({
      where: { abstractProductId: id, deletedAt: null },
      data: { deletedAt: now },
    }),
  ]);
};
