import { randomUUID } from 'node:crypto';
import { request } from './supabase-local.mjs';
const now = new Date().toISOString();
const existing = await request('/rest/v1/tenants?slug=eq.suporte_ti&select=id');
if (!existing.length) await request('/rest/v1/tenants', { method:'POST', headers:{Prefer:'return=minimal'}, body:JSON.stringify([{id:randomUUID(),slug:'suporte_ti',name:'Suporte de TI',created_at:now,updated_at:now}]) });
console.log('Tenant suporte_ti pronto no Supabase local.');
