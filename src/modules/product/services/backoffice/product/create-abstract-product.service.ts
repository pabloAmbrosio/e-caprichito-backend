import { db } from '../../../../../lib/prisma';
import { CreateAbstractProductInput } from '../../../schemas/create-abstract-product.schema';
import { generateSlug, handlePrismaError } from '../../helpers/shared';
import { abstractProductSelect } from '../../../product.select';
import type { ServiceResult, AbstractProductResult } from '../../types';

export const createAbstractProductService = async (
  input: CreateAbstractProductInput,
  createdBy: string,
): Promise<ServiceResult<AbstractProductResult>> => {
  const slug = input.slug || generateSlug(input.title);

  try {
    const data = await db.abstractProduct.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        categoryId: input.categoryId,
        tags: input.tags,
        isFeatured: input.isFeatured ?? false,
        seoMetadata: input.seoMetadata,
        createdBy,
      },
      select: abstractProductSelect,
    });

    return { msg: 'Producto abstracto creado exitosamente', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
