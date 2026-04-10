import type { ServiceResult, BackofficeProductDetail } from '../../types';
import { findProductBackofficeOrFail } from '../../helpers/product/find-product-backoffice-or-fail';
import { validateStatusTransition } from '../../helpers/product/validate-status-transition';
import { changeProductStatus } from '../../helpers/product/change-product-status';
import { mapToBackofficeDetail } from '../../helpers/product/map-to-backoffice-detail';

export const changeProductStatusService = async (
  id: string,
  newStatus: string,
): Promise<ServiceResult<BackofficeProductDetail>> => {
  const current = await findProductBackofficeOrFail(id);
  validateStatusTransition(current.status, newStatus);
  await changeProductStatus(id, newStatus);

  const updated = await findProductBackofficeOrFail(id);
  const data = mapToBackofficeDetail(updated);

  return { msg: `Producto actualizado a ${newStatus}`, data };
};
