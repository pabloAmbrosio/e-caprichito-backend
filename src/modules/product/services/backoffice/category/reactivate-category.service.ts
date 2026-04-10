import type { ServiceResult } from '../../types';
import { findCategoryOrFail, reactivateCategory } from '../../helpers/category';

export const reactivateCategoryService = async (
  id: string,
): Promise<ServiceResult<{ id: string }>> => {
  await findCategoryOrFail(id, true);
  await reactivateCategory(id);

  return { msg: 'Categoría reactivada', data: { id } };
};
