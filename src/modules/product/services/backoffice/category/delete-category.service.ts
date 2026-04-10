import type { ServiceResult } from '../../types';
import { findCategoryOrFail, deactivateCategory } from '../../helpers/category';

export const deleteCategoryService = async (
  id: string,
): Promise<ServiceResult<{ id: string }>> => {
  await findCategoryOrFail(id, true);
  await deactivateCategory(id);

  return { msg: 'Categoría desactivada', data: { id } };
};
