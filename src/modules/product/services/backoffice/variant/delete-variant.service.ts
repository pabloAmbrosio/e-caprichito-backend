import type { ServiceResult } from '../../types';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { softDeleteVariant } from '../../helpers/product/soft-delete-variant';

export const deleteVariantService = async (
  abstractProductId: string,
  variantId: string,
): Promise<ServiceResult<{ variantId: string }>> => {
  await findProductBackofficeOrFail(abstractProductId);
  await softDeleteVariant(abstractProductId, variantId);

  return { msg: 'Variante eliminada', data: { variantId } };
};
