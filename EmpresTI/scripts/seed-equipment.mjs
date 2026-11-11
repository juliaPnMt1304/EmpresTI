import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { request, url } from './supabase-local.mjs';

const [tenant] = await request('/rest/v1/tenants?slug=eq.suporte_ti&select=id');
if (!tenant) throw new Error('Rode o seed do tenant antes dos equipamentos.');
const existingRows = await request(`/rest/v1/equipments?tenant_id=eq.${tenant.id}&select=id,patrimony`);
const existingIds = new Map(existingRows.map((x)=>[x.patrimony,x.id]));
const inventory = JSON.parse(await readFile(resolve('skills/imagens-equipamentos/equipamentos.json'), 'utf8'));
const credits = JSON.parse(await readFile(resolve('data/imagens/creditos.json'), 'utf8'));
const approved = new Map(credits.filter((x) => x.status === 'aprovada' && x.revisor && x.revisado_em).map((x) => [x.patrimonio, x]));
if (inventory.length !== 12 || approved.size !== 12) throw new Error('Exige 12 fotos aprovadas e revisadas.');
const category = {notebook:'NOTEBOOK',monitor:'MONITOR',camera:'CAMERA',cabo:'ACCESSORY'};
const status = {disponivel:'AVAILABLE',manutencao:'MAINTENANCE'};
const now = new Date().toISOString();
const payload = inventory.map((item) => {
  if (!category[item.categoria] || !status[item.situacao]) throw new Error(`Item inválido: ${item.patrimonio}`);
  return {id:existingIds.get(item.patrimonio) || randomUUID(),tenant_id:tenant.id,name:item.nome,category:category[item.categoria],patrimony:item.patrimonio,
    status:status[item.situacao],location:'Balcão de Operações',image_url:`${url}/storage/v1/object/public/equipamentos/${item.patrimonio}.jpg`,created_at:now,updated_at:now};
});
await request('/rest/v1/equipments?on_conflict=tenant_id,patrimony', {method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(payload)});
console.log('12 equipamentos carregados no Supabase local.');
