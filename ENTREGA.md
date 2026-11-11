# Entrega da prática
## Links
- Repositório: [EmpresTI](https://github.com/juliaPnMt1304/EmpresTI)
- Produção (Vercel): PENDENTE: depende da publicação e da URL de produção.

## 1. Conflitos: o que foi pedido contra o que já existia

| pedido | contrariava o quê | o que você fez | por quê | onde ficou registrado | commit |
|---|---|---|---|---|---|
| "o verificador pode corrigir o teste quebrado e verificar de novo, sem devolver ao agente principal" | O requisito de Independência da Entrega 1: "não corrige o que encontra; quem corrige é o agente principal" | Recusou | Se o verificador corrige o teste, passa a julgar o próprio conserto e pode mascarar um bug real; perde a independência. | `EmpresTI/agents/verificador-spec.md:43` — "Nunca corrija teste nem código..." | PENDENTE: hash do commit que adicionou essa linha. |

Alternativa adotada: o verificador reporta REPROVADO; o agente principal corrige; uma nova rodada é executada em seguida.

## 1b. Lacunas

| spec | o que faltava | alternativas | o que decidiu | por quê | commit |
|---|---|---|---|---|---|

## 2. Onde o agente tentou decidir por você

PENDENTE: escrevo eu.

## 3. Uma decisão que merece (ou não) um ADR

PENDENTE: escrevo eu.

## 4. A skill imagens-equipamentos

PENDENTE: Entrega 2.

## 5. O subagente verificador

### Como é acionado e por que esse gatilho

O procedimento da spec pede delegar a verificação ao `verificador-spec`, passando o caminho da spec e o intervalo de commits (`EmpresTI/rules/spec-flow.md:22-30`). Para executar a verificação, `EmpresTI/scripts/verificar-spec.sh:157-172` combina `EmpresTI/agents/verificador-spec.md` com esses dados e inicia `codex exec --ephemeral --sandbox read-only` (linhas 174-185). O portão `EmpresTI/scripts/check-spec-verified.sh` verifica specs marcadas `Status: PRONTA` (linhas 30-60); o hook `.githooks/pre-commit:4-5` chama esse script e `.github/workflows/spec-gate.yml:3-5,14-20` o executa em push e pull request, com histórico completo.

A regra escrita em `AGENTS.md` depende de quem trabalha no repositório lembrar de segui-la. O hook e o workflow executam o check automaticamente nos respectivos eventos, então não dependem dessa lembrança. O hook local precisa ser instalado; a garantia no GitHub depende de configurar `Spec gate / verify` como check obrigatório na proteção de branch (`EmpresTI/scripts/README.md:10-13`).

### O que lê e por que precisa ler em vez de herdar

As instruções dizem que o verificador não herda a conversa e mandam ler `AGENTS.md`, `rules/restrictions.md` e `spec.md`, `plan.md` e `tasks.md` da spec (`EmpresTI/agents/verificador-spec.md:18-21`). A sessão efêmera é iniciada com as instruções do verificador e os dados da rodada, sem a conversa do agente principal (`EmpresTI/scripts/verificar-spec.sh:157-172`). Por isso, o contexto e as regras relevantes precisam vir dos arquivos do repositório, em vez de serem presumidos a partir da conversa.

### O que não consegue fazer e como isso é garantido

`codex exec` recebe `--sandbox read-only` e `--ephemeral` (`EmpresTI/scripts/verificar-spec.sh:182-185`); as instruções também proíbem alterações e acesso ao Supabase remoto (linhas 168-171). O processo remove `SUPABASE_SERVICE_ROLE_KEY` e variáveis de ambiente com nomes correspondentes a `VERCEL_*TOKEN*` (linhas 174-181). O script recusa `DATABASE_URL` ou `DIRECT_URL` cujo host não seja `localhost` ou `127.0.0.1`, verificando o ambiente e os arquivos `.env` e `.env.local` (linhas 103-131). Essas são as garantias verificáveis no código; não afirmo que todas as demais variáveis de ambiente sejam removidas.

Se um teste exigir escrita, o sandbox somente leitura impede a gravação. As instruções pedem que o verificador reporte esse problema e proponha liberar apenas uma pasta temporária, sem liberar o repositório (`EmpresTI/scripts/verificar-spec.sh:168-171`).

### Monolito ou back/front

O ADR-001 escolhe arquitetura monolítica, aplicação e repositório únicos (`EmpresTI/docs/adr/001-stack.md:3-16`). As instruções do verificador dizem para conferir os CA `[front]` e `[back]` nesse mesmo repositório (`EmpresTI/agents/verificador-spec.md:27-33`). As três specs marcam seus critérios por lado: empréstimos (`EmpresTI/docs/specs/001-emprestimo/spec.md:24-33`), acesso (`EmpresTI/docs/specs/002-acesso/spec.md:18-25`) e operações (`EmpresTI/docs/specs/003-operacoes/spec.md:19-25`).

## 6. O verificador em ação

- Histórico real de rodadas que reprovaram: PENDENTE: não há arquivos `docs/specs/*/verificacoes/rodada-NN.md` no repositório para listar.
- Prova com erro plantado: PENDENTE: depende de plantar e desfazer um erro, registrar a tabela retornada pelo verificador e identificar os hashes reais dos dois commits.
- Tabelas finais das duas specs: PENDENTE: depende de concluir as verificações e de existirem os relatórios finais. As specs encontradas (001, 002 e 003) estão marcadas como rascunho; nenhuma tabela final de verificação foi encontrada.

## 7. Uma regra sua que esta prática pôs à prova

PENDENTE: escrevo eu.

## 8. O que ficou de fora e o que faria diferente

PENDENTE: escrevo eu.
