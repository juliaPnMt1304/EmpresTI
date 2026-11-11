# EmpresTI

Sistema de empréstimo de equipamentos internos de TI. Catálogo com a situação de cada item,
solicitação e devolução pelo colaborador, e tela de Operações com todos os empréstimos em aberto.
Substitui a planilha compartilhada. Negócio em [`docs/PRD.md`](docs/PRD.md).

Projeto de curso conduzido com SDD (spec → plano → tarefas → verificação) e com um repositório
instruído para agentes (aulas 9, 10 e 11: regras, skills, MCP e subagentes).

## Estrutura

```
EmpresTI/
├── AGENTS.md              contexto do projeto para qualquer agente (CLAUDE.md só importa este)
├── handoff.md             onde a sessão anterior parou
├── .mcp.json              MCP do Supabase, só leitura (auditoria em docs/auditorias/)
├── docs/
│   ├── PRD.md             o que o negócio precisa
│   ├── adr/               001 stack · 002 design system (+ errata de localização)
│   ├── specs/             001 empréstimo · 002 acesso · 003 operações (spec, plan, tasks)
│   ├── design-system.md   tokens e componentes          layout.md   as 6 telas
│   ├── auditorias/        skill e MCP de terceiros auditados
│   └── referencias/       insumo do ADR-001 (não é fonte de decisão)
├── rules/                 restrictions · operacao · checks · arquitetura · migration ·
│                          secrets · tests · handoff · spec-flow   (cada uma com gatilho)
├── skills/                typescript-best-practices (terceiro, adaptada)
├── agents/                verificador-spec (subagente que confere a spec sem editar)
├── front/prototipo/       protótipo estático das telas (index.html, app.js, style.css, config.js)
├── src/                   env.ts (Zod) e server/db.ts (singleton Prisma); app Next.js ainda não criado
├── prisma/                schema, migrations (0001_init com RLS e trigger), seed
├── scripts/               check-db.ts (diagnóstico) · serve-prototipo.mjs
├── tests/e2e/             testes do protótipo; cada um cita o CA que prova
└── .github/workflows/     CI: validate, typecheck, migrate deploy, seed, db:check
```

## Como rodar

```bash
cp .env.example .env            # preencha (o .env nunca é versionado nem enviado)
npm install
npx playwright install chromium # uma vez, para os testes de navegador

npm run proto                   # protótipo em http://localhost:8080
npm run test:e2e                # 37 testes, todos citam um CA (saída: TOTAL x/y)

npm run db:up                   # Postgres local na porta 5433 (opcional)
npm run db:migrate:deploy       # tabelas, RLS e trigger
npm run db:seed                 # tenant `suporte_ti` (idempotente)
npm run db:check                # conexão, migrations, RLS, trigger, seed
npm run check                   # db:validate + typecheck + test:e2e
```

O protótipo usa só o Supabase Auth com a chave pública (`front/prototipo/config.js`); a sessão
fica em memória. As regras do PRD (3 itens, 14 dias, atraso bloqueia, manutenção não é
disponível) rodam no navegador como referência; no produto elas serão impostas pelo servidor
(tRPC). Em produção a migration roda só no CI, nunca no boot.

## Como se trabalha (resumo)

1. Leia `AGENTS.md`, `rules/restrictions.md` e `rules/operacao.md`.
2. Feature nova: `rules/spec-flow.md` — perguntas em aberto → spec com CA → plano → tarefas.
3. Uma tarefa por vez; antes de dizer "pronto", `rules/checks.md`.
4. Ao terminar a spec: subagente `verificador-spec` (veredito PRONTA / NÃO PRONTA).
5. Ao fim da tarefa ou da sessão: `rules/handoff.md`.

Subagentes no Claude Code: `mkdir -p .claude/agents && cp agents/*.md .claude/agents/` (a fonte
continua em `agents/`).

## Estado das specs

| Spec | CA | Protótipo (front) | Servidor (back) |
|------|----|-------------------|-----------------|
| 001 empréstimo | CA-01…07 | CA-01…06 com teste | CA-01…07 sem teste (app Next não existe) |
| 002 acesso | CA-08…11, CA-16 | CA-08…11 com teste | CA-16 sem teste |
| 003 operações | CA-12…15 | CA-12…14 com teste | CA-12…15 sem teste |

Todas as specs são **rascunho aguardando aprovação do time** e trazem "Perguntas em aberto".

## Decisões pendentes

- Aprovar (ou ajustar) a migration `0002`: índice único parcial de empréstimo aberto por
  equipamento, `CHECK` de datas e trigger contra `TRUNCATE` em `audit_logs`
  (`docs/specs/001-emprestimo/plan.md`).
- Confirmar `rules/operacao.md` (commit, push, matriz de autorização, modelo por fase): vem
  preenchido com as sugestões da aula.
- Criar o app Next.js + tRPC (T2 da spec 001) — exige mostrar o que o scaffold vai gerar.
- Aula 10: o `project_ref` do MCP aponta para o único projeto Supabase conhecido; se ele for o
  de produção, `read_only=true` é obrigatório (já está).

## Licença
MIT (`LICENSE`). A skill `typescript-best-practices` é Apache-2.0 (`skills/…/LICENSE-APACHE-2.0.txt`).
