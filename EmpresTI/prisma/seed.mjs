import { spawnSync } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Execute o seed pelo npm.');
const statusOutput = execFileSync(process.execPath,[npmCli,'exec','--','supabase','status'],{encoding:'utf8',env:{...process.env,SUPABASE_TELEMETRY_DISABLED:'1'}});
const status = JSON.parse(statusOutput.slice(statusOutput.indexOf('{')));
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(status.API_URL)) throw new Error('Seed recusado fora do Supabase local.');
const env = {...process.env,SUPABASE_URL:status.API_URL,SUPABASE_SERVICE_ROLE_KEY:status.SERVICE_ROLE_KEY};
for (const script of ['seed-tenant.mjs', 'seed-equipment.mjs']) {
  const result = spawnSync(process.execPath, [resolve('scripts', script)], {stdio:'inherit',env});
  if (result.status !== 0) process.exit(result.status ?? 1);
}
