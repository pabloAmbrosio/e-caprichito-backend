import { describe, it, expect } from 'vitest';
import { generateSlug } from '../services/helpers/shared/generate-slug';
import { deriveThumbnails } from '../services/helpers/product/derive-thumbnails';
import { validateStatusTransition } from '../services/helpers/product/validate-status-transition';
import { sanitizeAutocomplete } from '../services/helpers/autocomplete/sanitize-autocomplete';
import { clampPagination } from '../customer-search-engine/helpers/clamp-pagination';
import { buildCategoryTree } from '../services/helpers/category/build-category-tree';

// ─── generateSlug ──────────────────────────────────────────────

describe('generateSlug', () => {
  it('convierte título a slug lowercase con guiones', () => {
    expect(generateSlug('Vestido Rojo Elegante')).toBe('vestido-rojo-elegante');
  });

  it('remueve acentos', () => {
    expect(generateSlug('Café Crème Ñoño')).toMatch(/^cafe-creme-nono/);
  });

  it('maneja espacios múltiples y extremos', () => {
    const slug = generateSlug('  Hello   World  ');
    expect(slug).not.toContain('  ');
    expect(slug[0]).not.toBe('-');
    expect(slug[slug.length - 1]).not.toBe('-');
  });

  it('maneja caracteres especiales', () => {
    const slug = generateSlug('iPhone 15 Pro (128GB)');
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});

// ─── deriveThumbnails ──────────────────────────────────────────

describe('deriveThumbnails', () => {
  it('devuelve undefined si no hay imágenes', () => {
    expect(deriveThumbnails(undefined)).toBeUndefined();
  });

  it('devuelve array vacío para array vacío', () => {
    const result = deriveThumbnails([]);
    expect(Array.isArray(result) || result === undefined).toBe(true);
  });

  it('agrega thumbnailUrl a cada imagen', () => {
    const result = deriveThumbnails([
      { imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/pic.jpg' },
    ]) as any[];

    expect(result).toBeDefined();
    expect(result![0].imageUrl).toBe('https://res.cloudinary.com/test/image/upload/v1/pic.jpg');
    expect(result![0].thumbnailUrl).toBeDefined();
  });

  it('conserva alt y order', () => {
    const result = deriveThumbnails([
      { imageUrl: 'https://example.com/img.jpg', alt: 'Mi imagen', order: 2 },
    ]) as any[];

    expect(result![0].alt).toBe('Mi imagen');
    expect(result![0].order).toBe(2);
  });
});

// ─── validateStatusTransition ──────────────────────────────────

describe('validateStatusTransition', () => {
  it('DRAFT → PUBLISHED es válido', () => {
    expect(() => validateStatusTransition('DRAFT', 'PUBLISHED')).not.toThrow();
  });

  it('DRAFT → ARCHIVED es válido', () => {
    expect(() => validateStatusTransition('DRAFT', 'ARCHIVED')).not.toThrow();
  });

  it('PUBLISHED → ARCHIVED es válido', () => {
    expect(() => validateStatusTransition('PUBLISHED', 'ARCHIVED')).not.toThrow();
  });

  it('PUBLISHED → DRAFT es válido', () => {
    expect(() => validateStatusTransition('PUBLISHED', 'DRAFT')).not.toThrow();
  });

  it('ARCHIVED → DRAFT es válido', () => {
    expect(() => validateStatusTransition('ARCHIVED', 'DRAFT')).not.toThrow();
  });

  it('ARCHIVED → PUBLISHED es inválido', () => {
    expect(() => validateStatusTransition('ARCHIVED', 'PUBLISHED')).toThrow();
  });

  it('mismo estado es inválido', () => {
    expect(() => validateStatusTransition('DRAFT', 'DRAFT')).toThrow();
  });
});

// ─── sanitizeAutocomplete ──────────────────────────────────────

describe('sanitizeAutocomplete', () => {
  it('escapa underscore', () => {
    expect(sanitizeAutocomplete('test_value')).toContain('\\_');
  });

  it('escapa porcentaje', () => {
    expect(sanitizeAutocomplete('100%')).toContain('\\%');
  });

  it('escapa backslash', () => {
    expect(sanitizeAutocomplete('back\\slash')).toContain('\\\\');
  });

  it('deja texto normal intacto', () => {
    expect(sanitizeAutocomplete('vestido rojo')).toBe('vestido rojo');
  });
});

// ─── clampPagination ───────────────────────────────────────────

describe('clampPagination', () => {
  it('valores normales pasan sin cambio', () => {
    const { safeLimit, safeOffset } = clampPagination(20, 40);
    expect(safeLimit).toBe(20);
    expect(safeOffset).toBe(40);
  });

  it('valores negativos se clampean a mínimos', () => {
    const { safeLimit, safeOffset } = clampPagination(-5, -10);
    expect(safeLimit).toBeGreaterThanOrEqual(1);
    expect(safeOffset).toBe(0);
  });

  it('limit excesivo se clampea al máximo', () => {
    const { safeLimit } = clampPagination(99999);
    expect(safeLimit).toBeLessThanOrEqual(100);
  });

  it('sin argumentos usa defaults', () => {
    const { safeLimit, safeOffset } = clampPagination();
    expect(safeLimit).toBeGreaterThanOrEqual(1);
    expect(safeOffset).toBe(0);
  });
});

// ─── buildCategoryTree ─────────────────────────────────────────

describe('buildCategoryTree', () => {
  it('array vacío devuelve array vacío', () => {
    expect(buildCategoryTree([])).toEqual([]);
  });

  it('categoría raíz sin hijos queda sola', () => {
    const flat = [
      { id: '1', name: 'Raíz', slug: 'raiz', parentId: null, description: null, image: null, emoticon: null, isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
    ];
    const tree = buildCategoryTree(flat as any);
    expect(tree.length).toBe(1);
    expect((tree[0] as any).children).toBeDefined();
    expect((tree[0] as any).children.length).toBe(0);
  });

  it('padre con hijos se anidan correctamente', () => {
    const now = new Date();
    const flat = [
      { id: '1', name: 'Padre', slug: 'padre', parentId: null, description: null, image: null, emoticon: null, isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: '2', name: 'Hijo A', slug: 'hijo-a', parentId: '1', description: null, image: null, emoticon: null, isActive: true, sortOrder: 1, createdAt: now, updatedAt: now },
      { id: '3', name: 'Hijo B', slug: 'hijo-b', parentId: '1', description: null, image: null, emoticon: null, isActive: true, sortOrder: 2, createdAt: now, updatedAt: now },
    ];
    const tree = buildCategoryTree(flat as any);
    expect(tree.length).toBe(1);
    expect((tree[0] as any).children.length).toBe(2);
  });
});
