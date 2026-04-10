import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';
import { backofficeProductDetailSelect } from '../../../product.select';
import type { UpdateProductInput } from '../../../schemas/update-product.schema';
import type { RawBackofficeProduct } from './find-product-backoffice-or-fail';
import { deriveThumbnails } from './derive-thumbnails';

export const executeProductUpdate = async (
  id: string,
  input: UpdateProductInput,
): Promise<RawBackofficeProduct> => {
  const { variants, ...abstractFields } = input;

  return db.$transaction(async (tx) => {
    const hasAbstractFields = Object.keys(abstractFields).length > 0;
    if (hasAbstractFields) {
      await tx.abstractProduct.update({
        where: { id },
        data: {
          ...abstractFields,
          seoMetadata: abstractFields.seoMetadata as Prisma.InputJsonValue | undefined,
        },
      });
    }

    if (variants?.length) {
      await Promise.all(
        variants.map(({ id: variantId, images, ...variantFields }) =>
          tx.product.update({
            where: { id: variantId, abstractProductId: id },
            data: {
              ...variantFields,
              images: deriveThumbnails(images),
              details: variantFields.details as Prisma.InputJsonValue | undefined,
            },
          }),
        ),
      );
    }

    const updated = await tx.abstractProduct.findUniqueOrThrow({
      where: { id },
      select: backofficeProductDetailSelect,
    });

    return updated as RawBackofficeProduct;
  });
};
