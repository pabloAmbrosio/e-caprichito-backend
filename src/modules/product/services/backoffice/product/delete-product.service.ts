import type { ServiceResult } from '../../types';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { softDeleteProduct } from '../../helpers/product/soft-delete-product';

export const deleteProductService = async (
  id: string,
): Promise<ServiceResult<{ id: string }>> => {
  await findProductBackofficeOrFail(id);
  await softDeleteProduct(id);

  return { msg: 'Producto eliminado', data: { id } };
};
