import { db } from '../../../../../lib/prisma';

export const changeProductStatus = async (id: string, newStatus: string): Promise<void> => {
  await db.abstractProduct.update({
    where: { id },
    data: {
      status: newStatus as any,
      publishedAt: newStatus === 'PUBLISHED' ? new Date() : undefined,
    },
  });
};
