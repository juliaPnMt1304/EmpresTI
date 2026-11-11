import { execFileSync, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const sql = await readFile('tests/sql/loan-rules.sql','utf8');
const result = spawnSync('docker.exe',['exec','-i','supabase_db_EmpresTI','psql','-U','postgres','-d','postgres','-X'],{input:sql,encoding:'utf8'});
if (result.status !== 0) throw new Error(`Verificação SQL local falhou: ${(result.stderr||'').slice(0,1200)}`);
for (const id of ['20_solicitacao','21_manutencao','22_limite','23_atraso','24_meus_emprestimos','25_unico','26_rls']) {
  if (!result.stdout.includes(`test_ca_${id}`)) throw new Error(`Saída não confirmou test_ca_${id}`);
  console.log(`test_ca_${id}: passou`);
}
console.log('Dados temporários revertidos ao final da transação.');
