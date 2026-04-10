import type { ServiceResult } from '../../types';
import { findCategoryOrFail } from '../../helpers/category';

export const getCategoryService = async (id: string): Promise<ServiceResult<Awaited<ReturnType<typeof findCategoryOrFail>>>> => {
  const data = await findCategoryOrFail(id, true);

  return { msg: 'Categoría encontrada', data };
};
