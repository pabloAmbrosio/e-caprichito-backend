import type { Prisma } from '../../../../../lib/prisma';
import type { ProductImageInput } from '../../../schemas/product-image.schema';

const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';
const THUMBNAIL_TRANSFORM = 'w_300,h_300,c_fill,q_auto,f_auto';

// Falls back to imageUrl if not a Cloudinary URL
function buildThumbnailUrl(imageUrl: string): string {
  const idx = imageUrl.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
  if (idx === -1) return imageUrl;

  const insertAt = idx + CLOUDINARY_UPLOAD_SEGMENT.length;
  return imageUrl.slice(0, insertAt) + THUMBNAIL_TRANSFORM + '/' + imageUrl.slice(insertAt);
}

export const deriveThumbnails = (
  images?: ProductImageInput[]
): Prisma.InputJsonValue | undefined => {
  if (!images) return undefined;
  return images.map(img => ({
    imageUrl: img.imageUrl,
    thumbnailUrl: buildThumbnailUrl(img.imageUrl),
    ...(img.alt !== undefined && { alt: img.alt }),
    ...(img.order !== undefined && { order: img.order }),
  }));
};
