# Auditoria — skill `typescript-best-practices` (terceiro)

Método da aula 10: skill de terceiro é auditada contra `AGENTS.md`, `rules/` e `docs/adr/` antes
de ser usada. Leitura integral de `skills/typescript-best-practices/SKILL.md` (138 linhas, sem
`references/`, `scripts/` nem `assets/`). Origem e licença: ver `metadata` da skill.

| trecho | conflito ou risco | veredito | motivo / ação feita |
|---|---|---|---|
| `description` original | Dispararia em qualquer arquivo TS, sem dizer o que não é dela | ajustar | Reescrita com "Não use para…" e `paths:` limitado a TS/TSX |
| "Make Illegal States Unrepresentable" (unions, branded types, const assertions, `never`) | Nenhum; `branded types` poderia virar "todo ID é value object" (isso seria ADR, não skill) | manter | Conhecimento portável; mantido como orientação |
| Zod: `z.string().uuid()` / `.email()` | Projeto usa Zod 4 (`^4.0.0`, `z.url()` em `src/env.ts`); a forma antiga é depreciada | ajustar | Trocado por `z.uuid()` e `z.email()` |
| Zod: exemplo `fetch('/api/users/…')` | Sugere rota REST; `rules/arquitetura.md` proíbe REST além do tRPC | ajustar | Exemplo passou a chamar API externa, com aviso |
| "Optional: type-fest" | Biblioteca fora do ADR-001; `restrictions.md` manda propor e esperar | ajustar | Seção trocada por nota "não instalar sem aprovação" |
| "Neste projeto": tRPC/`RouterInputs`, `.input()` Zod, singleton Prisma, `tenantId`, `env.ts` | Repetia regras já donas de `rules/arquitetura.md` (segundo dono) | remover (aponta) | Linhas trocadas por ponteiro; ficou só o que é de linguagem |
| "Neste projeto": `tsconfig` strict, `noUncheckedIndexedAccess` | Máquina verifica (`tsc`) | manter (aponta p/ check) | Texto cita `npm run typecheck` como dono da garantia |
| "Proibido `any`/`as`" | Limite que um lint conferiria; ESLint ainda não está instalado (ADR-001 §11) | ajustar | Suavizado para "evite"; vira check quando houver ESLint |
| Scripts / rede / instalação | Nenhum script na skill | manter | Nada a auditar |
| Tamanho | 138 linhas, sem referências | manter | Dentro do esperado |

Itens sem conflito: nenhuma decisão de requisito ou de critério de aceite; nenhum processo de
teste próprio. Pendente: os testes 1–3 de skill da aula 10 (enxerga? dispara? fica quieta?)
exigem uma sessão de agente e não foram executados.
