---
description: Proibições e padrões de arquitetura, segurança, multi-tenancy, dados e convenções do stack (ADR-001)
globs: ["src/**", "prisma/**", "scripts/**", "front/**", "tsconfig.json", "package.json"]
alwaysApply: false
---
# Arquitetura do stack

> leitor: agente

As decisões e o motivo de cada uma estão em `docs/adr/001-stack.md`. Este arquivo só diz o que
fazer e o que nunca fazer ao tocar no código; em conflito com o ADR, o ADR vence — pare e avise.

## Quando
Ao criar ou alterar qualquer arquivo em `src/`, `prisma/`, `scripts/`, `front/` ou nos arquivos
de configuração do projeto.

## Procedimento
1. **Dados e mutações** (ADR-001 §3–§4): todo acesso a dado e toda escrita passam por
   procedimento tRPC. Camadas: Router (`src/server/api/routers/<dominio>.ts`) → Service →
   Prisma. Um router por domínio.
2. **Entrada validada** (ADR-001 §4): todo `.input()` é um schema Zod. Formulários usam React
   Hook Form + `zodResolver` com o mesmo schema.
3. **Tipos de resposta** vêm de `RouterInputs`/`RouterOutputs` inferidos do `AppRouter`.
4. **Multi-tenancy** (ADR-001 §6): toda tabela de domínio nasce com `tenant_id`. O `tenant_id`
   é resolvido no `createContext` a partir da sessão, nunca do input. Toda query de domínio
   passa por `tenantProcedure`.
5. **Sessão** (ADR-001 §7): cookie `httpOnly` via `@supabase/ssr`. O protótipo estático
   (`front/prototipo/`) guarda a sessão só em memória.
6. **Prisma** (ADR-001 §5): instância única em `src/server/db.ts`. Runtime usa `DATABASE_URL`
   (pooler); `DIRECT_URL` é só de migration.
7. **Limites operacionais** (ADR-001 §9): operação cabe em 60 s (importação e relatório em
   lotes); sem WebSocket/SSE; sem fila nem job agendado — tudo roda dentro do request.
8. **Estilo** (ADR-001 §2, ADR-002): Tailwind com os tokens de `docs/design-system.md`;
   componentes shadcn/ui copiados para o repositório; TypeScript em `strict`.
9. Teste de isolamento (tenant A não vê dado do tenant B) para cada procedimento novo ou
   alterado — ver `rules/tests.md`.

## Verificação
Conferido por `rules/checks.md`, passo 5, com esta lista:
- [ ] Nenhum Server Component busca dado direto do Prisma.
- [ ] Nenhuma Server Action de mutação; nenhuma rota REST além de `app/api/trpc/[trpc]/route.ts`.
- [ ] Nenhum tipo de resposta escrito à mão.
- [ ] Todo procedimento de domínio usa `tenantProcedure`; nenhum lê `tenant_id` do `input()`.
- [ ] Nenhum `new PrismaClient()` fora de `src/server/db.ts` (e de `prisma/seed.ts` e `scripts/`).
- [ ] Todo `.input()` tem Zod.
- [ ] Nenhuma operação nova depende de >60 s, de conexão aberta ou de trabalho agendado.

## Não faça
- Não busque dado do Prisma em Server Component nem crie Server Action para mutação.
- Não exponha rota REST além do endpoint único do tRPC; não versione API.
- Não importe `SUPABASE_SERVICE_ROLE_KEY` em código alcançável pelo bundle do cliente
  (detalhe em `rules/secrets.md`).
- Não guarde sessão em `localStorage` nem `sessionStorage`.
- Não confie em lembrar do `where: { tenantId }` manual em cada service.
- Não rode migration no boot da aplicação (`instrumentation.ts`, middleware etc.).
