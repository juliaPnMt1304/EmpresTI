# Plano — Spec 003

## Restrições que este plano obedece
- `docs/adr/001-stack.md` (§3, §6, §10); `docs/adr/002-design-system.md`; `rules/arquitetura.md`.

## Como cada parte será feita
- **Protótipo (feito):** `app.js` — lista paginada com filtros e busca, devolução que atualiza
  estatísticas, catálogo e "meus empréstimos"; formulário com validação e checagem de
  duplicidade na amostra. A gravação real é feita pelo tRPC (não existe ainda).
- **Servidor:** `loan.listOpen` (admin), `loan.returnAtCounter` (admin, com `audit_logs`) e
  `equipment.create` (admin; Zod com `PAT-\d{3,}`; unicidade do banco devolve conflito
  tratado) — todos em `tenantProcedure` + checagem de papel.
- Skill: `typescript-best-practices`. Gráficos de Operações (PRD, última linha) só com CA e
  skill própria — fora desta spec.
