import type { ServiceResult, BackofficeProductDetail } from '../../types';
import type { AddVariantsInput } from '../../../schemas/add-variants.schema';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { addVariantsToProduct } from '../../helpers/product/add-variants-to-product';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';
import { handlePrismaError } from '../../helpers/shared';

export const addVariantsService = async (
  abstractProductId: string,
  input: AddVariantsInput,
  createdBy: string,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  await findProductBackofficeOrFail(abstractProductId);

  try {
    await addVariantsToProduct(abstractProductId, input.variants, createdBy);
  } catch (error) {
    return handlePrismaError(error);
  }

  const updated = await findProductBackofficeOrFail(abstractProductId);
  const data = mapToBackofficeDetail(updated);

  return { msg: 'Variantes agregadas', data };
};
