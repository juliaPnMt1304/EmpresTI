# Spec 005 — Solicitar empréstimo no catálogo

> Status: RASCUNHO. Entrega local baseada nas decisões registradas pela responsável e no PRD.

## Objetivo
Permitir que um colaborador cadastrado pelo Supabase Auth solicite equipamentos disponíveis e
acompanhe seus empréstimos em aberto no front local.

## Vínculo
- ADRs: 004 (acesso local via Supabase) e 005 (imagens Pixabay).
- Banco: `equipments`, `loans`, `memberships` e `users`.
- Front local: `index.html` e `app.js`.

## Regras
- Até 5 empréstimos em aberto por pessoa.
- Prazo de 14 dias corridos.
- Atraso bloqueia nova solicitação; equipamento em manutenção/emprestado não pode ser solicitado.
- A sessão Auth determina usuário e tenant; a tela nunca envia tenant.

## Critérios de aceitação
| ID | Lado | Critério |
|---|---|---|
| CA-20 | [front][back] | Pedir item disponível cria empréstimo aberto com prazo de 14 dias corridos e o remove da disponibilidade. |
| CA-21 | [front][back] | Item em manutenção não pode ser solicitado e a tela explica que está indisponível. |
| CA-22 | [front][back] | Com 5 empréstimos abertos, o 6º é recusado e o motivo fica visível. |
| CA-23 | [back] | Usuário com empréstimo vencido não consegue pedir outro. |
| CA-24 | [front][back] | “Meus empréstimos” lista os itens em aberto da sessão e suas datas previstas. |
| CA-25 | [back] | Não pode haver mais de um empréstimo aberto para o mesmo equipamento. |
| CA-26 | [back] | RLS/RPC não permite que um usuário ou tenant leia/solicite empréstimo de outro. |

## Fora de escopo
Devolução pelo colaborador, operações administrativas e publicação em produção.

## Verificação local
`npm run test:spec` (front e catálogo) e `npm run test:loan` (regras SQL em transação revertida).
