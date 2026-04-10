import { db } from '../../../../../lib/prisma';
import type { ServiceResult, BackofficeProductDetail } from '../../types';
import { ProductNotFoundError } from '../../../errors';
import { validateStatusTransition } from '../../helpers/product/validate-status-transition';
import { changeVariantStatus } from '../../helpers/product/change-variant-status';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';

export const changeVariantStatusService = async (
  abstractProductId: string,
  variantId: string,
  newStatus: string,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  const variant = await db.product.findFirst({
    where: { id: variantId, abstractProductId, deletedAt: null },
    select: { status: true },
  });

  if (!variant) throw new ProductNotFoundError();

  validateStatusTransition(variant.status, newStatus);
  await changeVariantStatus(abstractProductId, variantId, newStatus);

  const updated = await findProductBackofficeOrFail(abstractProductId);
  const data = mapToBackofficeDetail(updated);

  return { msg: `Variante actualizada a ${newStatus}`, data };
};
