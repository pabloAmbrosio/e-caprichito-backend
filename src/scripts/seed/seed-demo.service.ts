import { PrismaClient } from '../../lib/prisma';
import { ProductStatus } from '../../lib/prisma';
import { DEMO_USERS } from './demo/users.demo';
import { DEMO_CATEGORIES } from './demo/categories.demo';
import { DEMO_PROMOTIONS } from './demo/promotions.demo';
import { ropaSeed } from './demo/ropa.demo';
import { conjuntos_bebeSeed } from './demo/conjuntos-bebe.demo';
import { gorras_infantilesSeed } from './demo/gorras-infantiles.demo';
import { ropa_infantilSeed } from './demo/ropa-infantil.demo';
import { cobertores_bebeSeed } from './demo/cobertores-bebe.demo';
import { panalerasSeed } from './demo/panaleras.demo';
import { almohadasSeed } from './demo/almohadas.demo';
import { set_cobertoresSeed } from './demo/set-cobertores.demo';

interface NewDemoProduct {
  categorySlug: string;
  images: { cutout: string; lifestyle: string };
  title: string;
  slug: string;
  description: string;
  tags: string[];
  priceInCents: number;
  compareAtPriceInCents?: number;
  details: Record<string, string>;
  isFeatured: boolean;
  stock: number;
  seoMetadata?: { metaTitle: string; metaDescription: string; keywords: string[] };
}

const ALL_PRODUCTS: NewDemoProduct[] = [
  ...ropaSeed as unknown as NewDemoProduct[],
  ...conjuntos_bebeSeed as unknown as NewDemoProduct[],
  ...gorras_infantilesSeed as unknown as NewDemoProduct[],
  ...ropa_infantilSeed as unknown as NewDemoProduct[],
  ...cobertores_bebeSeed as unknown as NewDemoProduct[],
  ...panalerasSeed as unknown as NewDemoProduct[],
  ...almohadasSeed as unknown as NewDemoProduct[],
  ...set_cobertoresSeed as unknown as NewDemoProduct[],
];

const SEED_BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:3000';

export const seedDemo = async (db: PrismaClient) => {
  // ─── Usuarios ────────────────────────────────────────────────
  for (const user of DEMO_USERS) {
    await db.user.create({ data: user });
    console.log(`👤 Demo user: ${user.email} (${user.adminRole})`);
  }

  // ─── Categorías ──────────────────────────────────────────────
  for (const { parent, subcategories } of DEMO_CATEGORIES) {
    const parentData = { ...parent };
    if (parentData.image && !parentData.image.startsWith('http')) {
      parentData.image = `${SEED_BASE_URL}${parentData.image}`;
    }
    const created = await db.category.create({ data: parentData });
    console.log(`📂 Categoría: ${created.name}`);

    for (const sub of subcategories) {
      const subData = { ...sub, parentId: created.id };
      if (subData.image && !subData.image.startsWith('http')) subData.image = `${SEED_BASE_URL}${subData.image}`;
      await db.category.create({ data: subData });
      console.log(`   └─ ${sub.name}`);
    }
  }

  // ─── Productos ───────────────────────────────────────────────
  const seller = await db.user.findUnique({ where: { username: 'seller1' } });
  if (!seller) {
    console.log('⚠️  No se encontró seller1 — saltando seed de productos');
    return;
  }

  const allCategories = await db.category.findMany({ select: { id: true, slug: true } });
  const slugToId = new Map(allCategories.map(c => [c.slug, c.id]));

  let skuCounter = 1;
  let created = 0;
  let skipped = 0;

  for (const product of ALL_PRODUCTS) {
    const categoryId = slugToId.get(product.categorySlug);

    if (!categoryId) {
      console.log(`⚠️  Categoría no encontrada: ${product.categorySlug} — saltando "${product.title}"`);
      skipped++;
      continue;
    }

    const sku = `CAP-${String(skuCounter++).padStart(4, '0')}`;

    const images = [
      { imageUrl: product.images.cutout, thumbnailUrl: product.images.cutout, alt: `${product.title} - producto`, order: 0 },
      { imageUrl: product.images.lifestyle, thumbnailUrl: product.images.lifestyle, alt: `${product.title} - modelo`, order: 1 },
    ];

    const abstractProduct = await db.abstractProduct.create({
      data: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        categoryId,
        tags: product.tags,
        status: ProductStatus.PUBLISHED,
        isFeatured: product.isFeatured,
        seoMetadata: product.seoMetadata ?? undefined,
        publishedAt: new Date(),
        createdBy: seller.id,
      },
    });

    const variant = await db.product.create({
      data: {
        abstractProductId: abstractProduct.id,
        title: product.title,
        sku,
        priceInCents: product.priceInCents,
        compareAtPriceInCents: product.compareAtPriceInCents,
        details: product.details,
        images,
        status: ProductStatus.PUBLISHED,
        createdBy: seller.id,
      },
    });

    await db.inventory.create({
      data: {
        productId: variant.id,
        physicalStock: product.stock,
        reservedStock: 0,
      },
    });

    created++;
    if (created % 50 === 0) console.log(`📦 ${created} productos creados...`);
  }

  console.log(`✅ ${created} productos creados${skipped ? `, ${skipped} saltados` : ''}`);

  // ─── Promociones ─────────────────────────────────────────────
  for (const promo of DEMO_PROMOTIONS) {
    const createdPromo = await db.promotion.create({
      data: {
        name: promo.name,
        description: promo.description,
        couponCode: promo.couponCode,
        priority: promo.priority,
        stackable: promo.stackable,
        isActive: promo.isActive,
        startsAt: promo.startsAt,
        endsAt: promo.endsAt,
        maxUsesPerUser: promo.maxUsesPerUser,
        ruleOperator: promo.ruleOperator,
        imageUrl: promo.imageUrl,
        colorPrimary: promo.colorPrimary,
        colorSecondary: promo.colorSecondary,
        badgeText: promo.badgeText,
        badgeColor: promo.badgeColor,
        rules: {
          create: promo.rules.map(r => ({
            type: r.type,
            operator: r.operator,
            value: r.value,
          })),
        },
        actions: {
          create: promo.actions.map(a => ({
            type: a.type,
            value: a.value,
            target: a.target,
            maxDiscountInCents: a.maxDiscountInCents ?? null,
          })),
        },
      },
    });

    console.log(`🏷️  Promoción: ${createdPromo.name}${promo.couponCode ? ` (cupón: ${promo.couponCode})` : ' (automática)'}`);
  }
};
