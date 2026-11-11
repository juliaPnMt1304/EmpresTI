# Auditoria — skill `imagens-equipamentos`

Escopo: instruções e scripts da skill, incluindo o gate interativo de publicação. A suíte local `npm run test:imagens` passou com 12 casos; não fez chamadas de rede.

| requisito | quem garante | evidência no repositório | limite verificado |
|---|---|---|---|
| Fonte | Script e instrução | `scripts/preparar.mjs`: `searchPixabay` e `downloadImage`; `scripts/lib.mjs`: `hostPermitido` | A busca usa a API Pixabay; o download só aceita HTTPS em `pixabay.com` e subdomínios. |
| Direito de imagem | Humano; filtro auxiliar no script | `scripts/lib.mjs`: `tagsProibidas`; `references/revisao-visual.md`: checklist humano | O filtro só examina tags. Não detecta pessoa, logo, texto ou conteúdo de tela com visão; a revisão visual não é automatizada. |
| Mesmo tamanho | Script | `scripts/lib.mjs`: `redimensionar` e `dimensaoOk`; `scripts/publicar.mjs`: `validarArquivos` | Reamostra para JPEG 800×600 e valida o arquivo final antes da publicação. |
| Sem repetição | Script | `scripts/preparar.mjs`: conjuntos `usedIds`/`usedHashes`; `scripts/publicar.mjs`: `validarArquivos` | Bloqueia ID Pixabay e SHA-256 repetidos entre os registros preparados. |
| Créditos | Script | `scripts/preparar.mjs`: `run` grava `pageURL`, `user`, `user_id`; `makeReview` exibe origem; `scripts/publicar.mjs`: `publicar` grava `url_publica` | Os metadados ficam no JSON de créditos; isso não prova que a aplicação exiba o crédito. |
| Armazenamento | Script | `scripts/preparar.mjs`: `run` grava em `imagens-build/`; `scripts/publicar.mjs`: `verificarBucket` e `publicar` | O envio só começa após validações, verificação do bucket e confirmação. Uma falha durante os POSTs pode ocorrer depois de uploads anteriores; não há rollback. |
| Produção | Humano + barreiras do script | `scripts/publicar.mjs`: `publicar` exige TTY; `solicitarConfirmacao` lista arquivos e exige `PUBLICAR` | TTY e texto de confirmação não identificam a pessoa. A publicação por humano depende do procedimento. |
| Segredos e dependências | Script e configuração humana | `scripts/publicar.mjs`: `publicar` lê `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` de `process.env`; `package.json`: `sharp` em `devDependencies`; `scripts/lib.mjs` importa `sharp` | O publicador não carrega `.env.local` nem imprime as credenciais. O código não verifica se elas foram fornecidas exclusivamente pelo terminal do humano; isso é uma condição operacional. |
| Crédito na tela | Instrução e implementação humana | `skills/imagens-equipamentos/SKILL.md`: requisito; `scripts/preparar.mjs`: `makeReview` mostra crédito apenas na página de revisão | Não foi localizada implementação de “Fotos: Pixabay” na tela da aplicação inspecionada; a página de revisão não comprova o crédito na tela do produto. |

## Aprovação e barreira de publicação

O `--aprovar` em `scripts/preparar.mjs` grava status, nome informado como revisor e data (`run`). Não há prova de identidade nem de que a inspeção visual foi feita; a aprovação por flag depende de o agente não aprovar por conta própria. O que o publicador impõe em código é `stdin.isTTY`, credenciais no ambiente, os pré-requisitos e a digitação exata de `PUBLICAR`. A afirmação de que a chave existe só no terminal do humano é uma regra de operação externa ao código, não uma garantia implementada.

## Não verificado

- Não foi executado `imagens:preparar` com uma chave real nem confirmada uma busca real no Pixabay.
- Não foi executado `imagens:publicar`; nenhum GET de bucket, POST de imagem ou acesso ao Supabase foi feito nesta tarefa.
- Não foram verificados a existência/publicidade do bucket remoto, credenciais, permissões ou acesso às URLs públicas.
- Não há `data/imagens/creditos.json` nem imagens preparadas neste checkout para validar uma publicação real.
- Nenhuma pessoa revisou fotos; os testes usam imagens sintéticas e dados fictícios em pasta temporária.
- A apresentação do crédito na tela da aplicação continua sem comprovação de código.
