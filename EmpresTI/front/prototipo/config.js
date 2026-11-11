/* =========================================================================
   EmpresTI — configuração pública do front-end
   -------------------------------------------------------------------------
   Aqui só entra valor que pode ser servido ao navegador: URL do projeto e
   chave PÚBLICA do Supabase (as mesmas `NEXT_PUBLIC_*` do .env).

   NUNCA coloque aqui a SUPABASE_SERVICE_ROLE_KEY: ela ignora o RLS e este
   arquivo é baixado por qualquer visitante (restrictions.md · Segurança).
   Operação administrativa é código de servidor (Route Handler),
   nunca front-end.

   Valores espelhados de `.env`:
     NEXT_PUBLIC_SUPABASE_URL      -> supabaseUrl
     NEXT_PUBLIC_SUPABASE_ANON_KEY -> supabasePublishableKey
   (a chave publicável `sb_publishable_…` substitui a anon key antiga)
   ========================================================================= */

/* Valores públicos do projeto Supabase usados em produção (Vercel).
   config.local.js (não versionado) ainda pode sobrescrever tudo isto em dev.
   >>> Cole abaixo a chave publicável (Supabase > Settings > API Keys >
   "Publishable key", começa com sb_publishable_). Ela é pública por design. */
window.EMPRESTI_CONFIG = Object.assign({
  supabaseUrl: 'https://fobuhqvjheblmwbiwera.supabase.co',
  supabasePublishableKey: ''
}, window.EMPRESTI_LOCAL_CONFIG || {});