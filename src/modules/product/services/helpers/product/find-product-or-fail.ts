import { db } from '../../../../../lib/prisma';
import { ProductNotFoundError } from '../../../errors';
import { productDetailSelect } from '../../../product.select';

// Accepts id or slug
export const findProductOrFail = async (idOrSlug: string) => {
  const product = await db.abstractProduct.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      deletedAt: null,
      status: 'PUBLISHED',
    },
    select: productDetailSelect,
  });

  if (!product) throw new ProductNotFoundError();

  return product;
};

export type RawProductDetail = NonNullable<
  Awaited<ReturnType<typeof findProductOrFail>>
>;
