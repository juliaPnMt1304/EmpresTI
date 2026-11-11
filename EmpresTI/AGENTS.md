# EmpresTI

Sistema de empréstimo de equipamentos internos de TI (notebooks, monitores, cabos, câmeras) para
colaboradores e para o time de Operações. Substitui a planilha compartilhada.

Negócio em `docs/PRD.md`. Stack decidida em `docs/adr/001-stack.md`; design system em
`docs/adr/002-design-system.md`.

## Onde olhar
- `docs/PRD.md` — o que o negócio precisa. Não é spec.
- `docs/adr/` — decisões técnicas já tomadas e o motivo delas (001 stack, 002 design system).
- `docs/specs/<NNN-funcionalidade>/` — spec, plano e tarefas de cada feature
  (001 empréstimo · 002 acesso · 003 operações).
- `docs/design-system.md` e `docs/layout.md` — tokens, componentes e as 6 telas.
- `docs/auditorias/` — auditoria de skills e MCP de terceiros.
- `rules/` — como se trabalha aqui. Leia `rules/restrictions.md` e `rules/operacao.md` sempre;
  `rules/checks.md` antes de dizer "pronto". Os demais têm gatilho (cada arquivo diz quando).
- `skills/`, `agents/`, `.mcp.json` — ver seções abaixo.
- `front/prototipo/` — protótipo estático das telas. `src/`, `prisma/`, `scripts/` — servidor e banco.
- `tests/e2e/` — testes do protótipo. `handoff.md` — onde a sessão anterior parou.

## Comandos
Definidos em `package.json`:
- subir o banco local: `npm run db:up` (Postgres na porta 5433)
- aplicar migrations / semente / diagnóstico: `npm run db:migrate:deploy` · `npm run db:seed` · `npm run db:check`
- zerar o banco local: `npm run db:reset`
- servir o protótipo: `npm run proto` (http://localhost:8080)
- rodar os testes: `npm run test:e2e` (precisa de `npx playwright install chromium` uma vez)
- validar schema e tipos: `npm run db:validate` · `npm run typecheck`
- tudo junto: `npm run check`
- buildar: **não existe ainda** (o app Next.js não foi criado).

## Ambiente
- Banco: Supabase (Postgres). O desenvolvimento acontece no banco LOCAL (`docker-compose.yml`).
- Deploy: Vercel (plano Hobby), ligada ao repositório remoto. Push publica.
- Configuração vem de variável de ambiente. Ver `.env.example`; segredos em `rules/secrets.md`.
- MCP `supabase` (`.mcp.json`): lê schema, políticas e docs do projeto Supabase, em modo
  somente leitura. Serve para conferir o banco real. Não serve para mudar schema
  (`rules/migration.md`) nem para dado de produção.

## Precedência
Se dois artefatos discordarem sobre comportamento, a spec vence o código.
Se algo não estiver escrito em lugar nenhum, pergunte — não decida.
Em conflito: `rules/restrictions.md` > ADRs > spec > `rules/*` > skills.

## Skills
- Ficam em `skills/<nome>/SKILL.md`.
- No início de cada tarefa, leia só o frontmatter (name e description) de cada skill. Carregue o
  corpo do SKILL.md apenas quando a tarefa casar com a description; abra `references/` só quando
  o SKILL.md mandar.
- Em conflito, `rules/` e `docs/adr/` vencem qualquer skill.
- Existentes: `typescript-best-practices` (terceiro, adaptada e auditada) e `imagens-equipamentos` (própria).

## Subagentes
- Ficam em `agents/<nome>.md`. O frontmatter diz quando delegar; o corpo é a instrução completa
  do subagente. Existente: `verificador-spec`.
- Subagente não herda esta conversa: ao delegar, passe tudo que o arquivo dele pede como entrada.
- Se o harness não tiver subagentes, abra uma sessão nova e comece com: "Aja conforme
  agents/<nome>.md." e as entradas pedidas.

## Estado atual do projeto
Existe:
- PRD, ADR-001, ADR-002, design system, layout e 3 specs em rascunho (CA numerados CA-01…CA-16).
- Protótipo estático das 6 telas com Supabase Auth (chave pública), regras do PRD em memória e
  testes de navegador que citam o CA (`tests/e2e/prototipo.spec.mjs`).
- Schema Prisma e migration `0001_init` (7 tabelas, RLS ligado sem policy, trigger append-only
  em `audit_logs`), seed do tenant `suporte_ti`, `scripts/check-db.ts`, CI em
  `.github/workflows/ci.yml` (validate, typecheck, migrate deploy, seed, db:check).
- `src/env.ts` (variáveis validadas com Zod) e `src/server/db.ts` (singleton Prisma).

NÃO existe ainda:
- App Next.js, tRPC (`createContext`, `tenantProcedure`, routers, services) e telas em React.
  Logo: nenhuma regra de negócio roda no servidor e não há build.
- Vitest, Testcontainers, ESLint, Prettier (previstos no ADR-001 §8 e §11); o CI não roda
  `test:e2e`.
- Migration `0002` (índice único de empréstimo aberto por equipamento, CHECKs de data, trigger
  contra TRUNCATE): proposta em `docs/specs/001-emprestimo/plan.md`, aguardando aprovação.
- Skills próprias do projeto e MCP de Slack/Jira/monday (não usados).

## Procedimentos
Cada procedimento tem gatilho próprio em `rules/`:
`arquitetura` (tocar em `src/`, `prisma/`, `front/`) · `migration` (tocar em `prisma/`) ·
`secrets` (env, config, `.mcp.json`) · `tests` (tocar em testes) · `spec-flow` (feature nova) ·
`handoff` (fim de tarefa ou sessão) · `checks` (antes de dizer "pronto") · `operacao` (sempre).

