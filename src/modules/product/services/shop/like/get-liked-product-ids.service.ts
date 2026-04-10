import type { ServiceResult } from '../../types';
import { findLikedProductIds } from '../../helpers/like/find-liked-product-ids';

export const getLikedProductIdsService = async (
  userId: string,
): Promise<ServiceResult<string[]>> => {
  const ids = await findLikedProductIds(userId);

  return { msg: 'IDs de productos favoritos obtenidos', data: ids };
};
