# 004 — Supabase local para acesso e dados do catálogo

## Contexto

As Entregas 3 e 4 precisam funcionar no front existente com login Supabase, catálogo persistido
e solicitação de empréstimo. A arquitetura prevista no ADR-001 (Next/tRPC/Prisma) ainda não foi
criada; a tela disponível é estática e o desenvolvimento deve usar somente Supabase local.

## Decisão

Para esta entrega acadêmica, a tela estática usa Supabase Auth e o cliente público Supabase para
ler dados protegidos por RLS. Solicitações passam por uma função SQL transacional que deriva
usuário e tenant da sessão JWT, valida as regras e grava no Postgres. Prisma Migrate continua
sendo o dono das migrations; o seed do tenant permanece separado do seed de equipamentos. A
configuração local é gerada em arquivo ignorado pelo Git. Nenhuma credencial de serviço chega ao
navegador. Este ADR restringe a aplicação ao Supabase local até uma decisão futura de produção.

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| Implementar Next/tRPC agora | A aplicação Next não existe e não cabe na entrega local imediata. |
| Escrita direta em tabela pelo navegador | A função SQL é necessária para tornar limite, atraso e disponibilidade atômicos. |
| Postgres Docker sem Supabase | Não inclui Auth e Storage compatíveis com o login e as imagens já preparados. |

## Consequências

- Auth, banco e Storage são exercitáveis no ambiente local.
- RLS limita leituras; a solicitação valida as regras no banco.
- A configuração de produção continua fora desta entrega e não será marcada como pronta.

## O que este ADR não decide

- Deploy, migração de produção, convites, retorno de empréstimo ou funções administrativas.
- Migração futura para Next/tRPC.
