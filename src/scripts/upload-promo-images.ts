/**
 * Script de un solo uso: sube imágenes de promociones a Cloudinary
 * y muestra las URLs para actualizar promotions.demo.ts.
 *
 * Uso:
 *   npx ts-node src/scripts/upload-promo-images.ts
 *
 * Prerequisitos:
 *   - Archivos de imagen en public/promos/ con estos nombres:
 *     promo-bienvenida.png
 *     promo-rosa.png
 *     promo-500.png
 *   - Variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('❌ Faltan variables de Cloudinary en .env');
  process.exit(1);
}

const FOLDER = 'promotions';
const TRANSFORMATION = 'w_1600,h_900,c_limit,q_auto,f_auto';

const PROMO_IMAGES = [
  { file: 'promo-bienvenida.png', publicId: 'promo-bienvenida' },
  { file: 'promo-rosa.png', publicId: 'promo-rosa' },
  { file: 'promo-500.png', publicId: 'promo-500' },
];

async function uploadImage(filePath: string, publicId: string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign =
    `folder=${FOLDER}` +
    `&public_id=${publicId}` +
    `&timestamp=${timestamp}` +
    `&transformation=${TRANSFORMATION}`;

  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + API_SECRET)
    .digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('api_key', API_KEY);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', FOLDER);
  formData.append('public_id', publicId);
  formData.append('transformation', TRANSFORMATION);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error subiendo ${filePath}: ${res.status} ${error}`);
  }

  const data = await res.json() as any;
  return data.secure_url;
}

async function main() {
  console.log('🚀 Subiendo imágenes de promociones a Cloudinary...\n');

  const results: Record<string, string> = {};

  for (const { file, publicId } of PROMO_IMAGES) {
    const filePath = path.join(__dirname, '../../public/promos', file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  No encontrado: ${filePath} — saltando`);
      continue;
    }

    const url = await uploadImage(filePath, publicId);
    results[publicId] = url;
    console.log(`✅ ${file} → ${url}`);
  }

  console.log('\n📋 URLs para promotions.demo.ts:\n');
  for (const [id, url] of Object.entries(results)) {
    console.log(`  ${id}: "${url}"`);
  }

  console.log('\n✅ Listo. Actualiza promotions.demo.ts con las URLs de arriba.');
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
