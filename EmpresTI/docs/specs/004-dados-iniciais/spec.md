# Spec 004 — Dados iniciais de equipamentos

> Status: RASCUNHO. Regras e dados vieram das decisões da responsável e de
> `skills/imagens-equipamentos/equipamentos.json`.

## Objetivo
Popular o tenant `suporte_ti` com 12 equipamentos e suas imagens aprovadas no Supabase local.

## Critérios de aceitação
| ID | Lado | Critério |
|---|---|---|
| CA-17 | [back] | Seed idempotente cria 12 equipamentos e mantém o seed do tenant separado. |
| CA-18 | [back] | Cabos são `ACCESSORY`; TI-0004, TI-0007 e TI-0010 iniciam em manutenção. |
| CA-19 | [front][back] | Catálogo exibe os 12 equipamentos com as imagens locais de 800×600. |

## Fora de escopo
Cadastro de imagens novas, publicar no Supabase remoto e crédito visual na tela.
