import type { ServiceResult } from '../../types';
import type { BackofficeProductDetail } from '../../types/product/backoffice-product-detail.types';
import type { UpdateProductInput } from '../../../schemas/update-product.schema';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { executeProductUpdate } from '../../helpers/product/execute-product-update';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';
import { handlePrismaError } from '../../helpers/shared';

export const updateProductService = async (
  id: string,
  input: UpdateProductInput,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  
  await findProductBackofficeOrFail(id);

  try {
    const raw = await executeProductUpdate(id, input);
    const data = mapToBackofficeDetail(raw);
    return { msg: 'Producto actualizado', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
