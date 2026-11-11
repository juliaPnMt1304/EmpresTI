# Spec 001 — Solicitar e devolver empréstimo

> Status: **RASCUNHO para aprovação do time.** Os CA abaixo vêm do `docs/PRD.md` (itens 2–4 e
> "Regras que Operações já decidiu") e do comportamento do protótipo. Nenhum CA foi inventado;
> o que o PRD não responde está em "Perguntas em aberto".

## Objetivo
Colaborador vê o catálogo com a situação de cada item, pede emprestado um item disponível e
devolve o que está com ele, respeitando as regras de Operações.

## Vínculo
- PRD: itens 2, 3 e 4; regras de limite, prazo, atraso e manutenção.
- ADRs: `docs/adr/001-stack.md` (tRPC, Prisma, multi-tenancy), `docs/adr/002-design-system.md`.
- Telas: catálogo (#s2), detalhe/solicitação (#s3), meus empréstimos (#s4) — `docs/layout.md`.
- Dados: `Equipment`, `Loan` (`prisma/schema.prisma`).

## Regras
- Máximo de 3 itens simultâneos por colaborador.
- Prazo padrão de devolução: 14 dias (retirada + 14 dias).
- Colaborador com item em atraso (aberto e `dueDate` vencido) não solicita novo empréstimo.
- Equipamento em manutenção nunca aparece como disponível; "Emprestado" deriva de empréstimo
  aberto (`returnedAt` nulo), não é status armazenado.

## Critérios de aceitação
| ID | Lado | Critério |
|----|------|----------|
| CA-01 | [front][back] | Solicitar um item Disponível cria um empréstimo aberto com devolução prevista em retirada + 14 dias; o item passa a Emprestado. |
| CA-02 | [front][back] | Com 3 itens em aberto, o colaborador não consegue solicitar o 4º (botão bloqueado e aviso na tela; recusa no servidor). |
| CA-03 | [front][back] | Com algum item em atraso, o colaborador não consegue solicitar novo empréstimo. |
| CA-04 | [front][back] | Equipamento em manutenção nunca aparece como Disponível (nem no filtro "Só disponíveis"). |
| CA-05 | [front][back] | Um equipamento tem no máximo um empréstimo aberto; item emprestado não pode ser solicitado por outra pessoa. |
| CA-06 | [front][back] | Devolver um item que está comigo o remove de "Meus empréstimos", reduz o contador e o devolve ao catálogo como Disponível. |
| CA-07 | [back] | Isolamento: o colaborador só vê e devolve os próprios empréstimos; um tenant não vê dado de outro. |

## Fora de escopo
Reserva com data futura; notificação por e-mail; importação da planilha atual; cadastro de
equipamento (spec 003); login e perfis (spec 002).

## Contrato afetado
- Banco: `loans`, `equipments`. DDL proposto (aguarda aprovação, `rules/migration.md`): índice
  único parcial `loans(equipment_id) WHERE returned_at IS NULL` para o CA-05 e `CHECK` de datas.
- tRPC (a criar em `src/server/api/routers/loan.ts` e `equipment.ts`): procedimentos de
  catálogo, solicitar e devolver, todos sob `tenantProcedure`.

## Perguntas em aberto (decisão do time)
1. O prazo conta dias corridos ou úteis? E "em atraso" começa à meia-noite do dia seguinte ao
   `dueDate` ou no instante exato?
2. Item em atraso de outra pessoa: o colaborador vê "Emprestado · devolve dd/mm" ou "Atrasado"?
3. Quem pode devolver um item de outra pessoa: só Operações (spec 003) ou também o próprio
   colaborador por engano? (O PRD só diz "devolver um item que está comigo".)
4. Equipamento `OUT_OF_SERVICE` ("Fora de uso") some do catálogo (design system §10.5) ou
   aparece indisponível? O PRD só cita manutenção.
