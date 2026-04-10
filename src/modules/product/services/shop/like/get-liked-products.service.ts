import type { ServiceResult, LikedProductsResult } from '../../types';
import { findLikedProducts } from '../../helpers/like/find-liked-products';
import { mapToLikedProduct } from '../../helpers/like/map-to-liked-product';

export const getLikedProductsService = async (
  userId: string,
  limit = 20,
  offset = 0,
): Promise<ServiceResult<LikedProductsResult>> => {
  const { rows, total } = await findLikedProducts(userId, limit, offset);
  const items = rows.map(mapToLikedProduct);

  return { msg: 'Productos favoritos obtenidos', data: { items, total } };
};
