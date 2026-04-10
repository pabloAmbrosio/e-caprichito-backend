import crypto from 'node:crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

async function deleteFolder(folder: string): Promise<void> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.log(`⚠️  Variables de Cloudinary no configuradas — saltando limpieza de ${folder}/`);
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const prefix = folder;

  // 1. Listar recursos en la carpeta
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const baseUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;

  let deleted = 0;
  let nextCursor: string | undefined;

  do {
    const params = new URLSearchParams({ type: 'upload', prefix, max_results: '100' });
    if (nextCursor) params.set('next_cursor', nextCursor);

    const listRes = await fetch(`${baseUrl}/resources/image?${params}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!listRes.ok) {
      console.log(`⚠️  Error listando ${folder}/: ${listRes.status} ${await listRes.text()}`);
      return;
    }

    const data = await listRes.json() as any;
    const publicIds: string[] = (data.resources || []).map((r: any) => r.public_id);

    if (publicIds.length === 0) break;

    // 2. Borrar en batch (max 100 por request)
    const deleteTimestamp = Math.round(Date.now() / 1000);
    const idsParam = publicIds.join(',');
    const toSign = `public_ids=${idsParam}&timestamp=${deleteTimestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const deleteRes = await fetch(`${baseUrl}/resources/image/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({ public_ids: publicIds }),
    });

    if (deleteRes.ok) {
      deleted += publicIds.length;
    } else {
      console.log(`⚠️  Error borrando batch en ${folder}/: ${deleteRes.status}`);
    }

    nextCursor = data.next_cursor;
  } while (nextCursor);

  if (deleted > 0) {
    console.log(`🗑️  Cloudinary: ${deleted} imágenes eliminadas de ${folder}/`);
  } else {
    console.log(`📂 Cloudinary: ${folder}/ ya estaba vacío`);
  }
}

export const cleanupPaymentImages = () => deleteFolder('payments');
