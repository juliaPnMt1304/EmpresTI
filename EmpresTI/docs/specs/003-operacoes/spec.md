# Spec 003 — Operações: empréstimos em aberto e cadastro de equipamento

> Status: **RASCUNHO para aprovação do time.** CA derivados do PRD (itens 2 e 5; "Operações:
> cadastra equipamentos, vê quem está com o quê e registra devolução no balcão").

## Objetivo
Operações enxerga todos os empréstimos em aberto, registra devolução no balcão e cadastra
equipamentos, sem depender da planilha.

## Vínculo
- PRD: itens 2 e 5; "Como saberemos que deu certo" (abandonar a planilha em duas semanas).
- ADR-001; telas #s5 e #s6 (`docs/layout.md`); `Equipment`, `Loan`, `AuditLog`.

## Regras
- Só o papel `ADMIN` (Operações) acessa estas telas e procedimentos.
- Patrimônio no formato `PAT-0000` e único por tenant (`@@unique([tenantId, patrimony])`).
- Ações de escrita geram registro em `audit_logs` (append-only, ADR-001 §10).

## Critérios de aceitação
| ID | Lado | Critério |
|----|------|----------|
| CA-12 | [front][back] | Operações vê todos os empréstimos em aberto, com filtros (Em atraso, Vencem esta semana, Notebooks) e busca; busca sem resultado mostra estado vazio. |
| CA-13 | [front][back] | Registrar devolução no balcão reduz "abertos" em 1 (e "atrasos" em 1 se estava atrasado) e devolve o item ao catálogo como Disponível. |
| CA-14 | [front][back] | O cadastro exige nome, patrimônio `PAT-0000` e barra patrimônio duplicado. |
| CA-15 | [back] | Equipamento cadastrado é persistido no tenant da sessão, com registro em `audit_logs`; situação "Manutenção"/"Fora de uso" respeita CA-04 da spec 001. |

## Fora de escopo
Reserva futura, e-mail, importação da planilha; edição e exclusão de equipamento com histórico
(a FK `RESTRICT` já proíbe apagar).

## Contrato afetado
`equipments`, `loans`, `audit_logs`; routers `equipment` e `loan` (procedimentos de Operações).

## Perguntas em aberto
1. Operações pode editar/arquivar equipamento? O PRD só cita cadastro.
2. "Vencem esta semana": semana corrente (seg–dom) ou próximos 7 dias?
3. O que o botão "Devolver" faz com item em atraso: só fecha o empréstimo ou registra algo mais?
