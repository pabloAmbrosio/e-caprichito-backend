import { db } from '../../../../../lib/prisma';
import { buildAutocompleteSql, STATEMENT_TIMEOUT_MS } from '../../helpers/autocomplete';
import type { ProductImage } from '../../../types/product-image.types';
import type { ServiceResult } from '../../types';

export interface AutocompleteSuggestion {
  id: string;
  title: string;
  slug: string;
  image: string | null;
}

interface AutocompleteRow {
  id: string;
  title: string;
  slug: string;
  images: ProductImage[] | null;
}

export async function autocompleteService(
  q: string,
  limit: number,
): Promise<ServiceResult<{ items: AutocompleteSuggestion[] }>> {
  const trimmed = q.trim().slice(0, 100);

  if (trimmed.length === 0) {
    return { msg: 'Sugerencias obtenidas', data: { items: [] } };
  }

  const sql = buildAutocompleteSql(trimmed, limit);

  const rows = await db.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = ${STATEMENT_TIMEOUT_MS}`);
    return tx.$queryRaw<AutocompleteRow[]>(sql);
  });

  const items: AutocompleteSuggestion[] = rows.map((row) => {
    const firstImage = Array.isArray(row.images) && row.images.length > 0
      ? row.images[0].imageUrl
      : null;

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      image: firstImage,
    };
  });

  return { msg: 'Sugerencias obtenidas', data: { items } };
}
