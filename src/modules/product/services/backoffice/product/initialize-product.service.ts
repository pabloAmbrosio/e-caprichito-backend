import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';
import { InitializeProductInput } from '../../../schemas/initialize-product.schema';
import { generateSlug, handlePrismaError } from '../../helpers/shared';
import { deriveThumbnails } from '../../helpers/product';
import { abstractProductSelect, productVariantSelect } from '../../../product.select';
import type { ServiceResult, InitializeProductResult } from '../../types';

export const initializeProductService = async (
  input: InitializeProductInput,
  createdBy: string,
): Promise<ServiceResult<InitializeProductResult>> => {
  const slug = input.slug || generateSlug(input.title);

  try {
    const data = await db.$transaction(async (tx) => {
      const abstractProduct = await tx.abstractProduct.create({
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

      const variants = await Promise.all(
        input.variants.map(async (variant) => {
          const product = await tx.product.create({
            data: {
              abstractProductId: abstractProduct.id,
              title: variant.title,
              sku: variant.sku,
              priceInCents: variant.priceInCents,
              compareAtPriceInCents: variant.compareAtPriceInCents,
              details: variant.details as Prisma.InputJsonValue,
              images: deriveThumbnails(variant.images),
              createdBy,
            },
            select: productVariantSelect,
          });
          await tx.inventory.create({
            data: {
              productId: product.id,
              physicalStock: variant.stock ?? 0,
              reservedStock: 0,
            },
          });
          return product;
        }),
      );

      return { abstractProduct, variants };
    });

    return { msg: 'Producto inicializado exitosamente', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
