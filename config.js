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

/* Sem arquivo local gerado, a aplicação não usa projeto remoto por acidente. */
window.EMPRESTI_CONFIG = window.EMPRESTI_LOCAL_CONFIG || {};
