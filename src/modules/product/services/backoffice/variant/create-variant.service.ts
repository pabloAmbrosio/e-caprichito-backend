import { db } from '../../../../../lib/prisma';
import { Prisma } from '../../../../../lib/prisma';
import { CreateProductInput } from '../../../schemas/create-product.schema';
import { AbstractProductNotFoundError } from '../../../errors';
import { handlePrismaError } from '../../helpers/shared';
import { deriveThumbnails } from '../../helpers/product';
import { productVariantSelect } from '../../../product.select';
import type { ServiceResult, ProductVariantResult } from '../../types';

export const createProductService = async (
  input: CreateProductInput,
  createdBy: string,
): Promise<ServiceResult<ProductVariantResult>> => {
  const abstractProduct = await db.abstractProduct.findUnique({
    where: { id: input.abstractProductId },
    select: { id: true },
  });

  if (!abstractProduct) {
    throw new AbstractProductNotFoundError();
  }

  try {
    const data = await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          abstractProductId: input.abstractProductId,
          title: input.title,
          sku: input.sku,
          priceInCents: input.priceInCents,
          compareAtPriceInCents: input.compareAtPriceInCents ?? undefined,
          details: input.details as Prisma.InputJsonValue,
          images: deriveThumbnails(input.images),
          createdBy,
        },
        select: productVariantSelect,
      });
      await tx.inventory.create({
        data: {
          productId: product.id,
          physicalStock: input.stock ?? 0,
          reservedStock: 0,
        },
      });
      return product;
    });

    return { msg: 'Variante creada exitosamente', data };
  } catch (error) {
    return handlePrismaError(error);
  }
};
