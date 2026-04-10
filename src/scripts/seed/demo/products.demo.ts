// Carpeta de public/products/ → slug de subcategoría
export const FOLDER_TO_CATEGORY_SLUG: Record<string, string> = {
  'Ropa_Mujer': 'ropa-mujer',
  'Ropa_Hombre': 'ropa-hombre',
  'Calzado_Deportivo': 'calzado-deportivo',
  'Calzado_Elegante': 'calzado-elegante',
  'Joyeria_Relojes': 'accesorios-joyeria',
  'Bolsos_Mochilas': 'accesorios-bolsos',
  'Skincare': 'belleza-skincare',
  'Maquillaje': 'belleza-maquillaje',
  'Cocina': 'hogar-cocina',
  'Sala_Dormitorio': 'hogar-sala',
  'gorras-deportivas': 'gorras-deportivas',
  'gorras-de-moda': 'gorras-moda',
  'ropa-de-bebe': 'bebe-ropa',
  'accesorios-de-bebe': 'bebe-accesorios',
};

interface DemoProduct {
  folder: string;
  image: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  priceInCents: number;
  compareAtPriceInCents?: number;
  details: Record<string, string>;
  isFeatured: boolean;
  stock: number;
}

const fileToTitle = (filename: string): string =>
  filename
    .replace('.png', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const fileToSlug = (folder: string, filename: string): string =>
  `${folder}-${filename.replace('.png', '')}`.toLowerCase().replace(/[_ ]/g, '-');

// ─── Ropa Mujer ─────────────────────────────────────────────────────

const ROPA_MUJER_VESTIDOS: DemoProduct[] = [
  'vestido-rojo-verano.png',
  'vestido_camisero_azul_celeste.png',
  'vestido_esmeralda_midi_verde.png',
  'vestido_tirantes_amarillo_pastel.png',
  'vestido_tirantes_midi_rosa.png',
  'vestido_tirantes_negro.png',
  'vestido_wrap_verde_bandera.png',
].map((img, i) => ({
  folder: 'Ropa_Mujer',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('ropa-mujer', img),
  description: `Vestido elegante para toda ocasión. Diseño exclusivo de El Caprichito.`,
  tags: ['vestido', 'mujer', 'moda'],
  priceInCents: [49900, 59900, 69900, 44900, 54900, 39900, 64900][i],
  compareAtPriceInCents: [69900, 79900, 89900, 59900, 74900, 54900, 84900][i],
  details: { talla: 'S-M-L-XL', material: 'Algodón/Poliéster' },
  isFeatured: true,
  stock: [30, 25, 20, 35, 28, 40, 22][i],
}));

const ROPA_MUJER_OTROS: DemoProduct[] = [
  { img: 'blazer_clasico_negro.png', price: 89900, tags: ['blazer', 'formal'] },
  { img: 'blazer_clasico_rosa.png', price: 89900, tags: ['blazer', 'formal'] },
  { img: 'blazer_cruzado_verde_bandera.png', price: 94900, tags: ['blazer', 'formal'] },
  { img: 'blusa_algodon_azul_celeste.png', price: 34900, tags: ['blusa', 'casual'] },
  { img: 'blusa_lazada_rosa.png', price: 39900, tags: ['blusa', 'elegante'] },
  { img: 'blusa_satinada_verde_esmeralda.png', price: 44900, tags: ['blusa', 'satinada'] },
  { img: 'camisa_oversize_azul_celeste.png', price: 42900, tags: ['camisa', 'oversize'] },
  { img: 'cardigan_corto_amarillo_pastel.png', price: 54900, tags: ['cardigan', 'tejido'] },
  { img: 'cardigan_punto_azul_celeste.png', price: 54900, tags: ['cardigan', 'punto'] },
  { img: 'chaqueta_pana_verde.png', price: 79900, tags: ['chaqueta', 'pana'] },
  { img: 'crop_top_verde.png', price: 24900, tags: ['top', 'crop'] },
  { img: 'falda_linea_A_amarillo_pastel.png', price: 44900, tags: ['falda', 'línea-a'] },
  { img: 'falda_plisada_corta_rosa.png', price: 39900, tags: ['falda', 'plisada'] },
  { img: 'falda_plisada_midi_negra.png', price: 49900, tags: ['falda', 'midi'] },
  { img: 'falda_tubo_verde_bandera.png', price: 44900, tags: ['falda', 'tubo'] },
  { img: 'pantalon_culotte_amarillo_pastel.png', price: 54900, tags: ['pantalón', 'culotte'] },
  { img: 'pantalon_palazzo_negro.png', price: 59900, tags: ['pantalón', 'palazzo'] },
  { img: 'pantalon_recto_verde_bandera.png', price: 54900, tags: ['pantalón', 'recto'] },
  { img: 'pantalon_wide_leg_verde_bandera.png', price: 59900, tags: ['pantalón', 'wide-leg'] },
  { img: 'shorts_lino_azul_celeste.png', price: 34900, tags: ['shorts', 'lino'] },
  { img: 'top_encaje_negro.png', price: 29900, tags: ['top', 'encaje'] },
  { img: 'top_halter_verde_bandera.png', price: 27900, tags: ['top', 'halter'] },
].map(({ img, price, tags }) => ({
  folder: 'Ropa_Mujer',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('ropa-mujer', img),
  description: `Prenda de moda femenina. Diseño exclusivo de El Caprichito.`,
  tags: ['mujer', 'moda', ...tags],
  priceInCents: price,
  details: { talla: 'S-M-L-XL', material: 'Algodón/Poliéster' },
  isFeatured: false,
  stock: 15,
}));

// ─── Ropa Hombre ─────────────────────────────────────────────────────

const ROPA_HOMBRE: DemoProduct[] = [
  { img: 'camiseta-blanca-basica.png', price: 24900, tags: ['camiseta', 'básica'] },
  { img: 'camiseta-el-caprichito.png', price: 34900, tags: ['camiseta', 'caprichito'], featured: true },
].map(({ img, price, tags, featured }) => ({
  folder: 'Ropa_Hombre',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('ropa-hombre', img),
  description: `Ropa masculina de calidad. Diseño exclusivo de El Caprichito.`,
  tags: ['hombre', 'moda', ...tags],
  priceInCents: price,
  details: { talla: 'S-M-L-XL', material: 'Algodón 100%' },
  isFeatured: featured ?? false,
  stock: 50,
}));

// ─── Calzado ─────────────────────────────────────────────────────────

const CALZADO_DEPORTIVO: DemoProduct[] = [
  { img: 'sneakers-blancos-azul.png', price: 129900, tags: ['sneakers', 'casual'] },
  { img: 'sneakers-ninos-colores.png', price: 89900, tags: ['sneakers', 'niños'] },
  { img: 'training-negro.png', price: 109900, tags: ['training', 'gym'] },
].map(({ img, price, tags }) => ({
  folder: 'Calzado_Deportivo',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('calzado-deportivo', img),
  description: `Calzado deportivo cómodo y de alto rendimiento.`,
  tags: ['calzado', 'deportivo', ...tags],
  priceInCents: price,
  details: { talla: '22-28 MX', material: 'Textil/Sintético' },
  isFeatured: false,
  stock: 20,
}));

const CALZADO_ELEGANTE: DemoProduct[] = [
  { img: 'ballet-flats-beige.png', price: 69900, tags: ['flats', 'elegante'] },
].map(({ img, price, tags }) => ({
  folder: 'Calzado_Elegante',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('calzado-elegante', img),
  description: `Calzado elegante para ocasiones especiales.`,
  tags: ['calzado', 'elegante', ...tags],
  priceInCents: price,
  details: { talla: '22-26 MX', material: 'Piel sintética' },
  isFeatured: false,
  stock: 12,
}));

// ─── Accesorios ──────────────────────────────────────────────────────

const JOYERIA: DemoProduct[] = [
  { img: 'aretes-oro-stud.png', price: 29900, tags: ['aretes', 'oro'] },
  { img: 'collar-plata-cristal.png', price: 49900, tags: ['collar', 'plata'] },
  { img: 'reloj-acero-cronografo.png', price: 149900, tags: ['reloj', 'acero'], featured: true },
].map(({ img, price, tags, featured }) => ({
  folder: 'Joyeria_Relojes',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('joyeria', img),
  description: `Joyería y accesorios de alta calidad.`,
  tags: ['accesorios', 'joyería', ...tags],
  priceInCents: price,
  details: { material: tags.includes('oro') ? 'Oro 14k' : tags.includes('plata') ? 'Plata 925' : 'Acero inoxidable' },
  isFeatured: featured ?? false,
  stock: 25,
}));

const BOLSOS: DemoProduct[] = [
  { img: 'cartera-cuero-cafe.png', price: 89900, tags: ['cartera', 'cuero'] },
  { img: 'crossbody-beige-canvas.png', price: 59900, tags: ['crossbody', 'canvas'] },
  { img: 'mochila-negra-urbana.png', price: 69900, tags: ['mochila', 'urbana'], featured: true },
].map(({ img, price, tags, featured }) => ({
  folder: 'Bolsos_Mochilas',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('bolsos', img),
  description: `Bolsos y mochilas con estilo para cada momento.`,
  tags: ['accesorios', 'bolsos', ...tags],
  priceInCents: price,
  details: { material: tags.includes('cuero') ? 'Cuero genuino' : 'Canvas/Textil' },
  isFeatured: featured ?? false,
  stock: 18,
}));

// ─── Belleza ─────────────────────────────────────────────────────────

const SKINCARE: DemoProduct[] = [
  { img: 'crema-hidratante.png', price: 34900, tags: ['crema', 'hidratante'] },
  { img: 'protector-solar-spf50.png', price: 29900, tags: ['protector', 'solar'] },
  { img: 'serum-vidrio-gotero.png', price: 44900, tags: ['serum', 'vitamina-c'] },
].map(({ img, price, tags }) => ({
  folder: 'Skincare',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('skincare', img),
  description: `Producto de cuidado facial para una piel radiante.`,
  tags: ['belleza', 'skincare', ...tags],
  priceInCents: price,
  details: { contenido: '50ml', tipo: 'Facial' },
  isFeatured: false,
  stock: 60,
}));

const MAQUILLAJE: DemoProduct[] = [
  { img: 'labial-rojo.png', price: 24900, tags: ['labial', 'rojo'] },
  { img: 'mascara-pestanas.png', price: 29900, tags: ['máscara', 'pestañas'] },
  { img: 'paleta-sombras-tierra.png', price: 49900, tags: ['sombras', 'paleta'] },
].map(({ img, price, tags }) => ({
  folder: 'Maquillaje',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('maquillaje', img),
  description: `Maquillaje profesional para un look impecable.`,
  tags: ['belleza', 'maquillaje', ...tags],
  priceInCents: price,
  details: { tipo: 'Cosmético' },
  isFeatured: false,
  stock: 45,
}));

// ─── Hogar ───────────────────────────────────────────────────────────

const COCINA: DemoProduct[] = [
  { img: 'cafetera-moderna.png', price: 149900, tags: ['cafetera', 'electrodoméstico'] },
  { img: 'set-ollas-acero.png', price: 199900, tags: ['ollas', 'acero'] },
  { img: 'tabla-cortar-cuchillos.png', price: 79900, tags: ['tabla', 'cuchillos'] },
].map(({ img, price, tags }) => ({
  folder: 'Cocina',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('cocina', img),
  description: `Artículo de cocina de alta calidad para tu hogar.`,
  tags: ['hogar', 'cocina', ...tags],
  priceInCents: price,
  details: { material: tags.includes('acero') ? 'Acero inoxidable' : 'Mixto' },
  isFeatured: false,
  stock: 10,
}));

const SALA: DemoProduct[] = [
  { img: 'cojines-decorativos.png', price: 34900, tags: ['cojines', 'decoración'] },
  { img: 'lampara-mesa-moderna.png', price: 59900, tags: ['lámpara', 'moderna'] },
  { img: 'manta-fleece-gris.png', price: 44900, tags: ['manta', 'fleece'] },
].map(({ img, price, tags }) => ({
  folder: 'Sala_Dormitorio',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('sala', img),
  description: `Artículo decorativo para tu sala o dormitorio.`,
  tags: ['hogar', 'decoración', ...tags],
  priceInCents: price,
  details: { estilo: 'Moderno' },
  isFeatured: false,
  stock: 30,
}));

// ─── Gorras Deportivas ──────────────────────────────────────────────

const GORRAS_DEPORTIVAS: DemoProduct[] = [
  { img: 'Fondo de 01-gorra-negra-performance-el-caprichito eliminado.png', price: 34900, tags: ['performance', 'caprichito'], featured: true },
  { img: 'Fondo de 02-gorra-blanca-running eliminado.png', price: 29900, tags: ['running', 'blanca'] },
  { img: 'Fondo de 03-gorra-roja-negra-bicolor eliminado.png', price: 31900, tags: ['bicolor', 'roja'] },
  { img: 'Fondo de 04-gorra-camuflaje-el-caprichito eliminado.png', price: 34900, tags: ['camuflaje', 'caprichito'] },
].map(({ img, price, tags, featured }) => ({
  folder: 'gorras-deportivas',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('gorras-deportivas', img),
  description: `Gorra deportiva de alto rendimiento. Diseño exclusivo de El Caprichito.`,
  tags: ['gorras', 'deportivas', ...tags],
  priceInCents: price,
  details: { talla: 'Unitalla ajustable', material: 'Poliéster/Dri-Fit' },
  isFeatured: featured ?? false,
  stock: 75,
}));

// ─── Gorras de Moda ─────────────────────────────────────────────────

const GORRAS_DE_MODA: DemoProduct[] = [
  { img: 'Fondo de 01-dad-hat-pana-beige-el-caprichito eliminado.png', price: 39900, tags: ['dad-hat', 'pana', 'caprichito'], featured: true },
  { img: 'Fondo de 02-snapback-negra-flat-brim eliminado.png', price: 34900, tags: ['snapback', 'flat-brim'] },
  { img: 'Fondo de 03-bucket-hat-rosa-pastel eliminado.png', price: 32900, tags: ['bucket-hat', 'rosa'] },
  { img: 'Fondo de 04-trucker-mezclilla-el-caprichito eliminado.png', price: 36900, tags: ['trucker', 'mezclilla', 'caprichito'] },
  { img: 'Fondo de 05-gorra-verde-oliva-streetwear eliminado.png', price: 31900, tags: ['streetwear', 'verde'] },
].map(({ img, price, tags, featured }) => ({
  folder: 'gorras-de-moda',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('gorras-moda', img),
  description: `Gorra de moda para el día a día. Diseño exclusivo de El Caprichito.`,
  tags: ['gorras', 'moda', ...tags],
  priceInCents: price,
  details: { talla: 'Unitalla ajustable', material: 'Algodón/Pana' },
  isFeatured: featured ?? false,
  stock: 100,
}));

// ─── Ropa de Bebé ───────────────────────────────────────────────────

const ROPA_DE_BEBE: DemoProduct[] = [
  { img: 'Fondo de 01-pijama-amarillo-lunares eliminado.png', price: 24900, tags: ['pijama', 'lunares'] },
  { img: 'Fondo de 02-overol-mezclilla-camiseta-rayas eliminado.png', price: 34900, tags: ['overol', 'mezclilla'] },
  { img: 'Fondo de 03-vestido-blanco-encaje eliminado.png', price: 29900, tags: ['vestido', 'encaje'] },
  { img: 'Fondo de 04-pijama-rosa-conejitos eliminado.png', price: 24900, tags: ['pijama', 'conejitos'] },
  { img: 'Fondo de 05-cardigan-verde-menta-tejido eliminado.png', price: 27900, tags: ['cardigan', 'tejido'] },
].map(({ img, price, tags }) => ({
  folder: 'ropa-de-bebe',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('bebe-ropa', img),
  description: `Ropa cómoda y suave para bebé. Diseño exclusivo de El Caprichito.`,
  tags: ['bebé', 'ropa', ...tags],
  priceInCents: price,
  details: { talla: '0-3M / 3-6M / 6-12M', material: 'Algodón 100%' },
  isFeatured: false,
  stock: 40,
}));

// ─── Accesorios de Bebé ─────────────────────────────────────────────

const ACCESORIOS_DE_BEBE: DemoProduct[] = [
  { img: 'Fondo de 01-biberon-rosa-el-caprichito eliminado.png', price: 19900, tags: ['biberón', 'caprichito'] },
  { img: 'Fondo de 02-chupetes-rosa-azul eliminado.png', price: 14900, tags: ['chupete', 'colores'] },
  { img: 'Fondo de 03-babero-lunares-el-caprichito eliminado.png', price: 12900, tags: ['babero', 'lunares', 'caprichito'] },
  { img: 'Fondo de 04-manta-amarilla-suave eliminado.png', price: 29900, tags: ['manta', 'suave'] },
  { img: 'Fondo de 05-mordedores-colores eliminado.png', price: 16900, tags: ['mordedor', 'colores'] },
].map(({ img, price, tags }) => ({
  folder: 'accesorios-de-bebe',
  image: img,
  title: fileToTitle(img),
  slug: fileToSlug('bebe-accesorios', img),
  description: `Accesorio esencial para bebé. Diseño exclusivo de El Caprichito.`,
  tags: ['bebé', 'accesorios', ...tags],
  priceInCents: price,
  details: { material: 'Libre de BPA / Algodón' },
  isFeatured: false,
  stock: 55,
}));

export const DEMO_PRODUCTS: DemoProduct[] = [
  ...ROPA_MUJER_VESTIDOS,
  ...ROPA_MUJER_OTROS,
  ...ROPA_HOMBRE,
  ...CALZADO_DEPORTIVO,
  ...CALZADO_ELEGANTE,
  ...JOYERIA,
  ...BOLSOS,
  ...SKINCARE,
  ...MAQUILLAJE,
  ...COCINA,
  ...SALA,
  ...GORRAS_DEPORTIVAS,
  ...GORRAS_DE_MODA,
  ...ROPA_DE_BEBE,
  ...ACCESORIOS_DE_BEBE,
];

