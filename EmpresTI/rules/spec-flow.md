---
description: Ciclo spec → plano → tarefas → verificação para qualquer funcionalidade nova do PRD
globs: ["docs/specs/**"]
alwaysApply: false
---
# Fluxo de spec

> leitor: agente

## Quando
Ao iniciar qualquer funcionalidade nova do PRD ou ao mudar o comportamento de uma existente.

## Procedimento
1. Crie `docs/specs/<NNN-nome-curto>/` com `spec.md` (modelo: `docs/specs/001-emprestimo/spec.md`).
2. Antes de escrever a spec, liste as perguntas que o PRD não responde. Espere as respostas.
3. `plan.md` sai da spec e cita os ADRs que o restringem e as skills usadas.
4. `tasks.md` sai do plano. Cada tarefa (`T<n>`) cita um `CA-xx` e cabe num commit.
5. Uma tarefa por vez. Ao terminar, siga `rules/checks.md`; ao fim da sessão, `rules/handoff.md`.
6. Cada CA é marcado `[front]` ou `[back]` (onde está a prova) e tem teste que cita o ID
   (`rules/tests.md`).

## Antes de declarar uma spec pronta
- Delegue ao subagente `verificador-spec` (`agents/verificador-spec.md`), passando o caminho
  da spec e o intervalo de commits.
- A spec só é pronta com "Veredito: PRONTA". Qualquer outro resultado volta para as tarefas —
  quem corrige é o agente principal, nunca o verificador.
- Só marque `Status: PRONTA` quando houver relatório em `verificacoes/rodada-NN.md` com
  `Veredito: PRONTA` e o commit verificado.
- `scripts/check-spec-verified.sh` bloqueia o commit se o relatório mais recente faltar,
  reprovar ou não corresponder ao histórico e às alterações permitidas.

## Verificação
Existe `docs/specs/<NNN-nome-curto>/{spec,plan,tasks}.md`; toda tarefa cita um CA; toda spec
declarada pronta tem a tabela do verificador com "Veredito: PRONTA".

## Não faça
- Não escreva código antes do plano aprovado.
- Não crie pasta de spec fora do padrão `NNN-nome-curto`.
- Não escreva critério de aceite por conta própria: o CA nasce na spec, aprovada por gente.
