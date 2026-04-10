import type { ServiceResult, CategoryListResult } from '../../types';
import { fetchAllCategories, buildCategoryTree, type CategoryFilter } from '../../helpers/category';

export const listCategoriesBackofficeService = async (
  filter: CategoryFilter = 'all',
): Promise<ServiceResult<CategoryListResult>> => {
  const flat = await fetchAllCategories(false, filter);
  const tree = buildCategoryTree(flat);

  return { msg: 'Categorías obtenidas', data: { tree, flat } };
};
