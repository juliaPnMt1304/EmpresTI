# Plano — Spec 002

## Restrições que este plano obedece
- `docs/adr/001-stack.md` §7 e §10; `rules/secrets.md`; `rules/arquitetura.md`.

## Como cada parte será feita
- **Protótipo (feito):** `front/prototipo/app.js` (login via `supabase-js` com chave pública,
  roteador por hash, `isOps()` só com `app_metadata`, `escapeHtml` na sidebar).
- **Servidor:** `createContext` lê a sessão do cookie (`@supabase/ssr`), resolve `userId`,
  `tenantId` e `role` por `memberships`; `protectedProcedure` exige sessão; `adminProcedure`
  exige `ADMIN`; `tenantProcedure` injeta o filtro de tenant.
- **Tela:** formulário com React Hook Form + `zodResolver` (mesmo schema Zod).
- Skill: `typescript-best-practices`.

## Riscos
- `user_metadata` é editável pelo usuário: nunca usar para autorização (CA-10).
- `supabase-js` carregado do CDN no protótipo, sem SRI nem versão fixa (ver `handoff.md`).
