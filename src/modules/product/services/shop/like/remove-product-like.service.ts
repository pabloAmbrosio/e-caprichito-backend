import type { ServiceResult } from '../../types';
import { assertProductExists } from '../../helpers/product/assert-product-exists';
import { removeProductLike } from '../../helpers/like/remove-product-like';

export const removeProductLikeService = async (
  abstractProductId: string,
  userId: string,
): Promise<ServiceResult<{ removed: boolean }>> => {
  await assertProductExists(abstractProductId);
  const count = await removeProductLike(abstractProductId, userId);

  return { msg: 'Like eliminado', data: { removed: count > 0 } };
};
