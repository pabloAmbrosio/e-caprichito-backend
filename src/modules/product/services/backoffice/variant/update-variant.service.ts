import { db, Prisma } from '../../../../../lib/prisma';
import type { ServiceResult, BackofficeProductDetail } from '../../types';
import type { UpdateVariantInput } from '../../../schemas/update-variant.schema';
import { ProductNotFoundError } from '../../../errors';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';
import { deriveThumbnails } from '../../helpers/product/derive-thumbnails';
import { handlePrismaError } from '../../helpers/shared';

export const updateVariantService = async (
  abstractProductId: string,
  variantId: string,
  input: UpdateVariantInput,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  const variant = await db.product.findFirst({
    where: { id: variantId, abstractProductId, deletedAt: null },
    select: { id: true },
  });

  if (!variant) throw new ProductNotFoundError();

  const { images, ...fields } = input;

  try {
    await db.product.update({
      where: { id: variantId },
      data: {
        ...fields,
        images: deriveThumbnails(images),
        details: fields.details as Prisma.InputJsonValue | undefined,
      },
    });

    const updated = await findProductBackofficeOrFail(abstractProductId);
    const data = mapToBackofficeDetail(updated);

    return { msg: 'Variante actualizada', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
