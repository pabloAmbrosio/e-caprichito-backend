import type { ServiceResult, CategoryResult } from '../../types';
import type { CreateCategoryInput } from '../../../schemas/create-category.schema';
import { generateSlug, handlePrismaError } from '../../helpers';
import { createCategoryRecord } from '../../helpers/category';

export const createCategoryService = async (
  input: CreateCategoryInput,
): Promise<ServiceResult<CategoryResult>> => {
  const slug = input.slug || generateSlug(input.name);

  try {
    const data = await createCategoryRecord({ ...input, slug });
    return { msg: 'Categoría creada', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
