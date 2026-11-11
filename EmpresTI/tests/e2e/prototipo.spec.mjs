import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const server = spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
let browser;
try {
  let ready = false;
  for (let i=0;i<40;i++) {
    try { if ((await fetch('http://127.0.0.1:8080')).ok) { ready=true; break; } } catch {}
    await new Promise((r)=>setTimeout(r,250));
  }
  assert.ok(ready,'Servidor local iniciou');
  const chrome = process.platform === 'win32' ? join(process.env.PROGRAMFILES || 'C:/Program Files','Google/Chrome/Application/chrome.exe') : undefined;
  browser = await chromium.launch({headless:true,...(chrome && existsSync(chrome) ? {executablePath:chrome} : {})});
  const page = await browser.newPage();
  await page.route('https://cdn.jsdelivr.net/**', (route)=>route.abort());
  await page.route('https://fonts.googleapis.com/**', (route)=>route.abort());
  await page.route('https://fonts.gstatic.com/**', (route)=>route.abort());
  const errors=[]; page.on('pageerror',(e)=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8080',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#login-form');
  assert.equal(await page.locator('#s1').isVisible(),true);
  assert.equal(await page.evaluate(()=>window.EMPRESTI_CONFIG.supabaseUrl.startsWith('http://127.0.0.1') || window.EMPRESTI_CONFIG.supabaseUrl.startsWith('http://localhost')),true);
  await page.locator('#show-signup').click();
  assert.equal(await page.locator('#signup-form').isVisible(),true);
  assert.equal(await page.locator('#signup-name').isVisible(),true);
  await page.locator('#show-login').click();
  assert.equal(await page.locator('#login-form').isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log('test_auth_tela_local_e_cadastro: passou');
  const npmCli = process.env.npm_execpath;
  const statusText = execFileSync(process.execPath,[npmCli,'exec','--','supabase','status'],{encoding:'utf8',env:{...process.env,SUPABASE_TELEMETRY_DISABLED:'1'}});
  const status = JSON.parse(statusText.slice(statusText.indexOf('{')));
  const catalogResponse = await fetch(`${status.API_URL}/rest/v1/equipments?select=id,name,category,patrimony,status,image_url&order=patrimony`,{headers:{apikey:status.SERVICE_ROLE_KEY,Authorization:`Bearer ${status.SERVICE_ROLE_KEY}`}});
  assert.equal(catalogResponse.status,200,'test_ca_19_catalogo_local');
  const catalog = await catalogResponse.json();
  assert.equal(catalog.length,12,'test_ca_19_12_cards');
  await page.evaluate((rows)=>{
    const labels={NOTEBOOK:'Notebook',MONITOR:'Monitor',CAMERA:'Câmera',ACCESSORY:'Acessório'};
    const icons={NOTEBOOK:'i-laptop',MONITOR:'i-monitor',CAMERA:'i-camera',ACCESSORY:'i-usb'};
    state.catalog=rows.map((row)=>({id:row.id,name:row.name,category:labels[row.category]||row.category,meta:`${labels[row.category]||row.category} · ${row.patrimony}`,pat:row.patrimony,imageUrl:row.image_url,icon:icons[row.category]||'i-package',state:row.status==='MAINTENANCE'?'maint':'ok'}));
    state.examples.catalogCount='12 equipamentos';
    renderCatalog();
  },catalog);
  assert.equal(await page.locator('#catalog-grid .equip-card').count(),12,'test_ca_19_grade_catalogo');
  assert.equal(await page.locator('#catalog-grid .equip-card img').count(),12,'test_ca_19_imagens_nos_cards');
  console.log('test_ca_19_catalogo_exibe_12_equipamentos_com_imagens: passou');
  const due = new Date(Date.now()+14*86400000).toISOString();
  await page.evaluate(async ({rows,dueDate})=>{
    const openLoans=[];
    const profile={id:'e2e-local-user',name:'Conta de teste local',department:'TI'};
    auth={
      from(table){const query={eq(){return this},is(){return this},order:async()=>({data:openLoans}),maybeSingle:async()=>({data:profile})};return {select(){return query}}},
      async rpc(name,args){
        if(name==='catalogo_equipamentos') return {data:rows.map((row)=>({...row,is_loaned:openLoans.some((loan)=>loan.equipment_id===row.id)}))};
        if(name==='solicitar_emprestimo'){
          const row=rows.find((item)=>item.id===args.p_equipment_id);
          if(row.status==='MAINTENANCE') return {error:{message:'EQUIPAMENTO_INDISPONIVEL'}};
          if(openLoans.length>=5) return {error:{message:'LIMITE_DE_5'}};
          openLoans.push({id:'loan-local-e2e',equipment_id:row.id,borrowed_at:new Date().toISOString(),due_date:dueDate,returned_at:null});
          return {data:'loan-local-e2e'};
        }
        throw new Error('RPC inesperado: '+name);
      }
    };
    session={user:{id:'e2e-local-auth-user'}};
    await loadSessionData();
    applySession();
  },{rows:catalog,dueDate:due});
  const availableCard=page.locator('#catalog-grid .equip-card.clickable').first();
  await availableCard.click();
  await page.locator('#open-dialog-btn').click();
  await page.locator('#dialog-confirm').click();
  await page.locator('#loan-rows .loan-row').waitFor({state:'visible',timeoutMs:5000});
  assert.match(await page.locator('#loan-rows').innerText(),/Devolver até/,'test_ca_20_prazo_visivel');
  console.log('test_ca_20_front_solicitacao_e_prazo: passou');
  await page.evaluate(()=>{location.hash='#s2';});
  await page.locator('#s2').waitFor({state:'visible',timeoutMs:5000});
  await page.evaluate(()=>{state.pendingItem=state.catalog.find((item)=>item.pat==='TI-0004');renderDetail();openLoanDialog();});
  assert.match(await page.locator('#detail-message').innerText(),/não está disponível/,'test_ca_21_manutencao_explicada');
  console.log('test_ca_21_front_manutencao_motivo: passou');
  await page.evaluate(async()=>{
    const row=state.catalog.find((item)=>item.state==='ok');
    const now=new Date().toISOString();
    const rows=Array.from({length:5},(_,i)=>({id:`loan-limit-${i}`,equipment_id:`different-${i}`,borrowed_at:now,due_date:new Date(Date.now()+14*86400000).toISOString(),returned_at:null}));
    auth.from=()=>({select:()=>({eq(){return this},is(){return this},order:async()=>({data:rows}),maybeSingle:async()=>({data:{id:'e2e-local-user',name:'Conta de teste local',department:'TI'}})})});
    await loadSessionData(); state.pendingItem=row; renderDetail(); openLoanDialog();
  });
  assert.match(await page.locator('#detail-message').innerText(),/Limite de 5/,'test_ca_22_limite_explicado');
  console.log('test_ca_22_front_limite_motivo: passou');
  await page.evaluate(()=>{location.hash='#s4';});
  assert.match(await page.locator('#loan-rows').innerText(),/Devolver até/,'test_ca_24_meus_emprestimos_data');
  console.log('test_ca_24_front_meus_emprestimos_data: passou');
} finally {
  if(browser) await browser.close();
  server.kill();
}
