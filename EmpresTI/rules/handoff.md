---
description: Procedimento de fim de tarefa/sessão — onde parei, o que está commitado, aplicado e publicado
globs: []
alwaysApply: false
---
# Handoff

> leitor: agente

## Quando
Ao terminar uma tarefa do plano, ao perceber que a sessão está longa, antes de trocar de
assunto ou quando eu disser "vamos fechar".

## Procedimento
Sobrescreva `handoff.md` na raiz com, no máximo, 25 linhas:
1. Onde parei — tarefa (`T<n>`) e critério (`CA-xx`) em andamento.
2. O que está commitado e em qual branch.
3. O que está aplicado no banco local mas ainda não commitado.
4. O que já foi publicado (push, deploy).
5. O que NÃO fazer na próxima sessão e por quê.
6. O próximo passo, em uma frase imperativa.

## Verificação
Uma sessão nova, lendo só `handoff.md` + a spec, continua sem perguntar nada sobre o que já foi
feito.

## Não faça
- Não escreva o que você não pode provar (`git log`, `git status`, `npm run db:migrate:status`).
- Não passe de 25 linhas nem copie conteúdo de spec, ADR ou regra: aponte para o arquivo.
