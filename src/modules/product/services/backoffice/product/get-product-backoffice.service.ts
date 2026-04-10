import type { ServiceResult } from '../../types';
import type { BackofficeProductDetail } from '../../types/product/backoffice-product-detail.types';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';

export const getProductBackofficeService = async (
  id: string,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  const raw = await findProductBackofficeOrFail(id);
  const data = mapToBackofficeDetail(raw);

  return { msg: 'Producto encontrado', data };
};
