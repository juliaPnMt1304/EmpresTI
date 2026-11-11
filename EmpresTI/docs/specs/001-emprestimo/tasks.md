# Tarefas — Spec 001

Uma tarefa por commit (`rules/operacao.md`). Status: ✅ feita · ⬜ pendente · ⏸ aguarda decisão.

| ID | Tarefa | CA | Lado | Status |
|----|--------|----|------|--------|
| T0 | Protótipo: catálogo, solicitação, devolução, limite 5, atraso, manutenção, prazo de 14 dias corridos (`front/prototipo`) + testes `test_ca_01..06` | CA-01…06 | front | ✅ |
| T1 | Aprovar o DDL da migration `0002` (índice parcial + CHECK) e gerá-la | CA-05 | back | ⏸ |
| T2 | Instalar o app Next + tRPC + `tenantProcedure` (scaffold: mostrar o que será criado) | todos [back] | back | ⏸ ADR/plano aprovado |
| T3 | `loan.request` com regras de limite de 3, atraso, status e prazo + testes (Testcontainers) | CA-01, 02, 03, 04, 05 | back | ⬜ |
| T4 | `loan.return` + `loan.listMine` + testes | CA-06 | back | ⬜ |
| T5 | Teste de isolamento de tenant e de usuário para `loan.*` e `equipment.list` | CA-07 | back | ⬜ |
| T6 | Telas #s2–#s4 em Next consumindo os procedimentos | CA-01…06 | front | ⬜ |
| T7 | Verificação final com `verificador-spec` | todos | — | ⬜ |
