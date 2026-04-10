import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';
import { backofficeVariantSelect } from '../../../product.select';
import type { CreateProductInput } from '../../../schemas/create-product.schema';
import { deriveThumbnails } from './derive-thumbnails';

export const addVariantsToProduct = async (
  abstractProductId: string,
  variants: Omit<CreateProductInput, 'abstractProductId'>[],
  createdBy: string,
) => {
  return db.$transaction(async (tx) => {
    const created = [];
    for (const variant of variants) {
      const product = await tx.product.create({
        data: {
          abstractProductId,
          title: variant.title,
          sku: variant.sku,
          priceInCents: variant.priceInCents,
          compareAtPriceInCents: variant.compareAtPriceInCents ?? undefined,
          details: variant.details as Prisma.InputJsonValue,
          images: deriveThumbnails(variant.images),
          createdBy,
        },
        select: backofficeVariantSelect,
      });
      await tx.inventory.create({
        data: {
          productId: product.id,
          physicalStock: variant.stock ?? 0,
          reservedStock: 0,
        },
      });
      created.push(product);
    }
    return created;
  });
};
