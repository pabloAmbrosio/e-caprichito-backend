import type { ServiceResult, CategoryResult } from '../../types';
import type { UpdateCategoryInput } from '../../../schemas/update-category.schema';
import { generateSlug, handlePrismaError } from '../../helpers';
import { findCategoryOrFail, updateCategoryRecord } from '../../helpers/category';

export const updateCategoryService = async (
  id: string,
  input: UpdateCategoryInput,
): Promise<ServiceResult<CategoryResult>> => {
  
  await findCategoryOrFail(id, true);

  const slug = input.slug || (input.name ? generateSlug(input.name) : undefined);

  try {
    const data = await updateCategoryRecord(id, { ...input, slug });
    return { msg: 'Categoría actualizada', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
