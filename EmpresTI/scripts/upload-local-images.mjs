import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(url)) throw new Error('Upload bloqueado: só é permitido para Supabase local.');
const entries = JSON.parse(await readFile(resolve('data/imagens/creditos.json'), 'utf8'));
if (entries.length !== 12 || entries.some((item) => item.status !== 'aprovada' || !item.revisor || !item.revisado_em)) throw new Error('São necessárias 12 imagens aprovadas e revisadas.');
for (const item of entries) {
  const body = await readFile(resolve(item.arquivo));
  const response = await fetch(`${url}/storage/v1/object/equipamentos/${item.patrimonio}.jpg`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' }, body,
  });
  if (!response.ok) throw new Error(`Upload local de ${item.patrimonio} falhou (HTTP ${response.status}).`);
}
console.log('12 imagens enviadas ao Storage local.');
