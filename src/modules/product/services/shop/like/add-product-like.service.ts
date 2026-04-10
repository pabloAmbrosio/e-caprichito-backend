import type { ServiceResult } from '../../types';
import { assertProductExists } from '../../helpers/product/assert-product-exists';
import { createProductLike } from '../../helpers/like/create-product-like';

export const addProductLikeService = async (
  abstractProductId: string,
  userId: string,
): Promise<ServiceResult<{ id: string; abstractProductId: string; createdAt: Date }>> => {
  await assertProductExists(abstractProductId);
  const data = await createProductLike(abstractProductId, userId);

  return { msg: 'Like agregado', data };
};
