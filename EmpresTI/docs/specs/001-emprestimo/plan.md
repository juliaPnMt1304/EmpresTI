# Plano — Spec 001

## Restrições que este plano obedece
- `docs/adr/001-stack.md` — Next.js + tRPC + Prisma + Supabase; multi-tenancy por coluna (§6);
  testes (§8).
- `docs/adr/002-design-system.md` — tokens e componentes.
- `rules/arquitetura.md`, `rules/migration.md`, `rules/tests.md`.

## Como cada parte será feita
- **Protótipo (feito):** regras 1–6 aplicadas no estado em memória de `front/prototipo/app.js`;
  provadas por `tests/e2e/prototipo.spec.mjs`. Serve de referência visual e de comportamento.
- **Banco:** a migration `0001_init` já tem as tabelas. Nova migration `0002` (a aprovar):
  índice único parcial de empréstimo aberto por equipamento (CA-05) e `CHECK` de datas.
  Procedimento: mostrar o DDL e parar (`rules/migration.md`). Proposta testada em Postgres 16
  descartável; falta confirmar que o `prisma migrate dev` não tenta removê-la.
- **Servidor:** `loan.request` e `loan.return` em `src/server/api/routers/loan.ts` → service
  `loanService` (contagem de abertos do usuário, atraso, status do equipamento, `dueDate =
  now + 14 d`) → Prisma. `equipment.list` esconde `OUT_OF_SERVICE` e nunca marca manutenção como
  disponível. Tudo em `tenantProcedure`, `.input()` com Zod.
- **Tela:** componentes Next conforme `docs/layout.md`, consumindo `RouterOutputs`; solicitação
  e devolução com otimismo do TanStack Query.
- Skill usada: `typescript-best-practices` (tipos, Zod).

## Riscos
- Corrida entre duas solicitações do mesmo item: sem o índice parcial o service sozinho não
  impede (verificado: o banco aceita dois empréstimos abertos).
- App Next.js ainda não existe: os CA [back] ficam SEM TESTE até a tarefa T2 em diante.
