# Entrega da prática

## Links

- Repositório: [EmpresTI](https://github.com/juliaPnMt1304/EmpresTI)
- Produção (Vercel): **PENDENTE** — não houve publicação; ADR-004 limita esta entrega ao ambiente local (`EmpresTI/docs/adr/004-supabase-local-data.md:26-30`).

## Nota sobre evidências e hashes

O `HEAD` consultado é `47a6a07` (`Entrega 1 e 2: verificador de specs e skill imagens-equipamentos`). Esse é o commit-base anterior às mudanças das Entregas 3 e 4. O `git status` mostra essas mudanças como modificadas ou não rastreadas; portanto, **47a6a07 não comprova as decisões e o código descritos abaixo**. A coluna `commit` fica `PENDENTE` até existir um commit que contenha cada mudança. Não atribuí hashes às mudanças locais.

Os pareceres verbais dos verificadores são resumidos na seção 6, mas não há relatórios `verificacoes/rodada-NN.md` no repositório. Assim, eles ainda não são evidência arquivada que satisfaça `rules/spec-flow.md:22-29` nem o portão `scripts/check-spec-verified.sh`.

## 1. Conflitos: o que foi pedido contra o que já existia

| pedido | contrariava o quê | o que você fez | por quê | onde ficou registrado | commit |
|---|---|---|---|---|---|
| Escolher 5 empréstimos em aberto (decisão final da responsável) | A instrução anexada para a fase documental fixava 3 e dizia que o PRD prevalecia (`Texto colado.txt:110-111`); PRD e Spec 001 na base `47a6a07` também limitavam a 3 (`EmpresTI/docs/PRD.md:23`; `EmpresTI/docs/specs/001-emprestimo/spec.md:18,28`, naquele commit) | Escolhida 5; PRD e specs atuais foram ajustados | A decisão final da responsável prevaleceu para esta entrega; o limite é testado na função SQL e na interface | `EmpresTI/docs/PRD.md:24-27`; `EmpresTI/docs/specs/001-emprestimo/spec.md:18,27-28`; `EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:15,25` | **PENDENTE** |
| Contar 14 dias úteis (`Texto colado.txt:113-115,244`) | PRD e spec-base diziam apenas “14 dias”, sem definir calendário útil ou corrido (`EmpresTI/docs/PRD.md:24`; `EmpresTI/docs/specs/001-emprestimo/spec.md:19`, commit-base) | Escolheu 14 dias corridos | É a regra explícita que você selecionou e que a tela e o banco local aplicam | `EmpresTI/docs/PRD.md:24`; `EmpresTI/docs/specs/001-emprestimo/spec.md:19,27`; `EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:16,23` | **PENDENTE** |
| Usar Supabase diretamente no site estático, sem Next.js/tRPC (`Texto colado.txt:32-43,431-434`) | ADR-001 previa Next.js, tRPC e Prisma para a arquitetura futura (`EmpresTI/docs/adr/001-stack.md:1-4,34-91`, base `47a6a07`) | Manteve a tela estática para as Entregas 3 e 4 e registrou a exceção local | A aplicação Next/tRPC ainda não existe; não cabia implementá-la para entregar o fluxo local | `EmpresTI/docs/adr/004-supabase-local-data.md:5-24`; `EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:5-12` | **PENDENTE** |
| Mostrar fotografias do Pixabay | ADR-002 dizia “Fotografia: nenhuma” e preferia placeholders (`EmpresTI/docs/adr/002-design-system.md:68,72`, base `47a6a07`) | Escolheu Pixabay, Storage local e URL no equipamento | As fotos são necessárias para o catálogo dos 12 itens | `EmpresTI/docs/adr/005-fotos-pixabay.md:5-13,19-21`; `EmpresTI/docs/specs/004-dados-iniciais/spec.md:7,14` | **PENDENTE** |
| Exibir “Fotos: Pixabay” no rodapé (`Texto colado.txt:49-51`) | ADR-005 e a decisão de escopo da Spec 004 dispensam crédito visível nesta entrega | Escolheu não mostrar crédito na interface; preservou os metadados de atribuição no JSON | Você decidiu que o crédito na tela não era necessário para a demonstração | `EmpresTI/docs/adr/005-fotos-pixabay.md:6-13,20`; `EmpresTI/docs/specs/004-dados-iniciais/spec.md:16-17` | **PENDENTE** |
| Manter patrimônio `TI-0000` (decisão final da responsável) | O modelo anterior usava `PAT-0000` (`EmpresTI/docs/specs/003-operacoes/spec.md:16,24`, base `47a6a07`) | Alterou a regra documental para `TI-0000` | Esse é o padrão presente nos 12 patrimônios fornecidos | `EmpresTI/docs/specs/003-operacoes/spec.md:16,24`; `EmpresTI/skills/imagens-equipamentos/equipamentos.json:1-48` | **PENDENTE** |
| Persistir URLs das fotos dos equipamentos | O schema anterior não tinha campo `image_url`; `Equipment` já tinha categoria (`EmpresTI/prisma/schema.prisma:138-160`, base `47a6a07`) | Adicionou `imageUrl`/`image_url` | O catálogo precisa de uma referência à imagem no Storage; não foi necessário inventar uma categoria nova | `EmpresTI/prisma/schema.prisma:138-160`; `EmpresTI/prisma/migrations/0002_entregas_3_4/migration.sql:1,49-53` | **PENDENTE** |
| Usar Auth e Storage no ambiente local (`Texto colado.txt:190-194,251-255`) | O `docker-compose` da base subia `postgres:16`, sem os serviços e o schema `auth` do Supabase (`EmpresTI/docker-compose.yml:15-27`, base `47a6a07`) | Escolheu Supabase local, em vez do Postgres isolado | Login/Auth e Storage precisam funcionar junto com o banco | `EmpresTI/docs/adr/004-supabase-local-data.md:5-16,22-30`; `EmpresTI/supabase/config.toml:42` | **PENDENTE** |
| Atualizar seed e manter o seed do tenant separado (`Texto colado.txt:333-356`) | O pacote-base só tinha `prisma db seed`; não havia seed de equipamentos configurado (`EmpresTI/package.json:17`, base `47a6a07`) | Criou seed do tenant e seed de equipamentos separados, além de configurar `prisma.seed` | Reexecução não deve duplicar os 12 equipamentos nem misturar a criação do tenant com o inventário | `EmpresTI/docs/specs/004-dados-iniciais/spec.md:12`; `EmpresTI/docs/adr/004-supabase-local-data.md:13-15`; `EmpresTI/package.json:17-20,54`; `EmpresTI/prisma/seed.mjs:5-10` | **PENDENTE** |
| Permitir criar a própria conta na tela de login (pedido anterior da responsável) | Spec 002 dizia cadastro fechado e auto cadastro fora de escopo (`EmpresTI/docs/specs/002-acesso/spec.md:13,27-28`) | Foi incluído o fluxo de cadastro local na tela | Você quer criar sua conta real e entrar na aplicação, sem uma conta fictícia fornecida pelo agente | `index.html:78-102`; `app.js:748-849` | **PENDENTE; a decisão ainda não foi incorporada à Spec 002** |

**Correções de itens da auditoria preliminar:** a hipótese “`Equipment` talvez não tenha categoria” não se confirma: o enum e o campo `category` já existiam na base; a lacuna era a imagem (`EmpresTI/prisma/schema.prisma:114-160`, base `47a6a07`). A hipótese “senha escrita em arquivo” também não se confirma no texto recebido: ele proíbe salvar a senha e manda recebê-la por variável de ambiente (`Texto colado.txt:127-131`). Portanto, esses dois itens não são registrados como conflitos confirmados.

## 1b. Lacunas: o que foi pedido de forma incompleta

| spec | o que faltava | alternativas | o que decidiu | por quê | commit |
|---|---|---|---|---|---|
| 004 | A descrição inicial de manutenção mencionava dois itens; o inventário tem três | Manter dois, ou tratar a lista de inventário como completa | Manter TI-0004, TI-0007 e TI-0010 | Você escolheu explicitamente três itens em manutenção; o critério atual e os dados conferem | **PENDENTE** |
| 004 | O JSON usa categoria `cabo`, mas o banco usa um enum | Criar `CABLE`, usar `ACCESSORY` ou alterar os nomes de domínio | Mapear cabos para `ACCESSORY` | Foi sua decisão; o enum já comportava acessórios | **PENDENTE** |
| 004 | A imagem não tinha coluna em `Equipment` | Guardar URL em `image_url`, usar tabela separada ou buscar a imagem sob demanda | Guardar `image_url` no equipamento | Mantém uma URL por item e usa o Storage local definido em ADR-005 | **PENDENTE** |
| 004 | O briefing não definia como garantir que o seed fosse repetível e separado do tenant | Um seed combinado; seeds distintos; TypeScript ou ESM | Manter seed do tenant separado e adicionar seed de equipamentos no pacote, em ESM | Você pediu essa separação; o teste local repete os seeds e compara quantidade e IDs | **PENDENTE** |
| 004 | O pedido de banco local não dizia se bastava PostgreSQL ou se precisava de Auth/Storage | Postgres 16 isolado ou Supabase local | Supabase local | Necessário para reproduzir Auth e Storage localmente; ADR-004 registra a escolha | **PENDENTE** |
| 004 | O material pediu compatibilidade com PostgreSQL 16, mas o Supabase local está configurado com versão principal 17 | Validar a migration também em 16 ou assumir apenas Supabase local 17 | Não há decisão/validação de compatibilidade 16 registrada | A execução local no Supabase 17 não prova compatibilidade com o Postgres 16 do compose | **PENDENTE** |
| 004 | Não estava definido se o seed criaria usuário ou empréstimos de exemplo | Criar fixtures persistentes ou só equipamentos reais; usar dados temporários de teste | Nenhuma conta de professor ou empréstimo fictício foi semeado; os testes SQL usam transação com `ROLLBACK` | Você pediu tentar o cadastro com sua própria conta; fixtures de teste não devem permanecer no banco | **PENDENTE** |
| 004 | O que conta como prova de revisão visual humana não é verificável pelo script | Confiar no campo `status`, exigir assinatura ou manter checklist humano | O fluxo exige revisão humana, mas o campo de aprovação não comprova identidade ou inspeção | A skill reconhece esse limite (`EmpresTI/skills/imagens-equipamentos/SKILL.md:16,24`; auditoria `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:17-19`) | **PENDENTE** |
| 005 | Spec 002 exclui auto cadastro, mas a tela local tem link de cadastro | Manter convite fechado; registrar exceção de cadastro aberto local; retirar o link | A implementação local oferece cadastro via Supabase Auth; falta registrar a decisão na Spec 002 e alinhar o escopo | O comportamento não deve depender apenas do código ou desta entrega | **PENDENTE** |
| 005 | Não foi fornecida conta/senha real para testar login ponta a ponta | Criar conta fictícia; usar conta real fornecida; parar antes de criar usuário | Não criar usuário de teste persistente; deixar a responsável cadastrar sua própria conta | Evita inventar credenciais ou criar dados de professor sem autorização específica | **PENDENTE** |
| 005 | O pedido não especificava qual usuário e tenant a chamada de empréstimo deveria usar | Receber tenant do navegador ou derivá-lo da sessão | Derivar identidade/tenant do JWT no banco; o front não envia tenant | Evita que o cliente selecione outro usuário ou tenant | **PENDENTE** |
| 005 | Não havia regra transacional para concorrência, disponibilidade e limite | Validar só no front; gravar direto em tabela; bloquear no banco | RPC SQL transacional, locks e índice parcial | A validação precisa continuar valendo sob solicitações simultâneas | **PENDENTE** |
| 005 | A sessão de cadastro/login precisava de política de persistência | `localStorage`, `sessionStorage` ou memória | Manter sessão apenas em memória | Segue o requisito de sessão e evita gravá-la no armazenamento do navegador (`app.js:71-75`; Spec 002:16,24) | **PENDENTE** |
| 004/005 | O catálogo local e a produção não tinham uma decisão comum de publicação | Publicar em Vercel/Supabase remoto ou concluir apenas no local | Limitar a entrega ao ambiente local; não executar deploy nem escrita remota | Você pediu permanecer no local e não marcar produção como completa; ADR-004 registra a restrição | **PENDENTE** |

## 2. Onde o agente tentou decidir

Na análise inicial, o agente tratou o limite antigo do PRD (3) como a escolha a aplicar. Corrigida a direção para 5. A mudança aparece no PRD e nas specs atuais, enquanto o valor 3 pode ser conferido no commit-base `47a6a07` (`EmpresTI/docs/PRD.md:23`; `EmpresTI/docs/specs/001-emprestimo/spec.md:18,28`, naquele commit). A decisão final está nas regras atuais (`EmpresTI/docs/PRD.md:24-27`; `EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:15,25`). O hash que incluirá a correção continua **PENDENTE**.

## 3. Uma decisão que merece (ou não) um ADR

A decisão de usar fotos do Pixabay, mas não exibir crédito no produto, merece ADR porque altera duas regras anteriores: ADR-002 proibia fotografia e o briefing pedia crédito no rodapé. ADR-005 registra a alternativa de manter placeholders, a alternativa de mostrar o crédito e o motivo da escolha (`EmpresTI/docs/adr/005-fotos-pixabay.md:5-21`). A spec 004 também deixa crédito visual fora do escopo (`EmpresTI/docs/specs/004-dados-iniciais/spec.md:16-17`). O arquivo registra a decisão, mas seu commit ainda está **PENDENTE**.

## 4. A skill imagens-equipamentos

A skill mantém instruções de fluxo e limites em `SKILL.md`, documentação da API e do checklist humano em `references/`, e transformação/validação/envio em scripts. O critério é deixar intenção e revisão legíveis para pessoas e repetir automaticamente os requisitos mecânicos (`EmpresTI/skills/imagens-equipamentos/SKILL.md:11-36`; `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:5-15`).

| requisito | quem garante | evidência verificável |
|---|---|---|
| Fonte | Script + instrução | `EmpresTI/skills/imagens-equipamentos/SKILL.md:23,35`; auditoria: Pixabay e `hostPermitido` em `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:7` |
| Direito de imagem | Humano; filtro auxiliar de tags | checklist visual e limite do filtro: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:8,19` |
| Mesmo tamanho | Script | JPEG 800×600 e validação final: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:9`; fotos locais também testadas em `EmpresTI/tests/local-data.mjs:38-47` |
| Sem repetição | Script | IDs e SHA-256: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:10` |
| Créditos | Script para metadados; pessoa para a decisão de exibição | Metadados e `url_publica`: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:11`; ADR-005 mantém os registros (`EmpresTI/docs/adr/005-fotos-pixabay.md:11-13`) |
| Armazenamento | Script | Preparo local, bucket e `x-upsert`: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:12`; catálogo usa URL local em `EmpresTI/tests/local-data.mjs:38-47` |
| Produção | Humano + barreira interativa parcial | TTY e confirmação `PUBLICAR` não provam identidade e **não bloqueiam por si só um host remoto** (`EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:13,19`). Nenhuma publicação foi feita nesta entrega |
| Segredos e dependências | Script + ambiente operacional | `process.env`, ausência de carga de `.env.local` e `sharp` em `devDependencies`: `EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:14` |
| Crédito na tela | Decisão da responsável e código do produto | A skill pede crédito em `EmpresTI/skills/imagens-equipamentos/SKILL.md:31`, mas ADR-005 e Spec 004 decidem não exibi-lo nesta entrega (`EmpresTI/docs/adr/005-fotos-pixabay.md:11-13`; `EmpresTI/docs/specs/004-dados-iniciais/spec.md:16-17`). A auditoria não encontrou crédito na tela (`EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:15,28`) |

O JSON de créditos tem 12 registros marcados `aprovada` e `rejeitados: []` (por exemplo, `EmpresTI/data/imagens/creditos.json:15-17` e demais blocos). Isso significa **zero rejeições registradas**, não prova quantas fotos foram avaliadas nem que a revisão visual foi feita por uma pessoa identificável. A auditoria também registra essa limitação (`EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:19,27`).

O agente fica limitado pelo fluxo escrito e por TTY/`PUBLICAR`, mas o publicador não demonstra tecnicamente que o destino é local nem prova que a chave veio do terminal da pessoa. Por isso não afirmo que o código impede sozinho uma publicação em produção (`EmpresTI/docs/auditorias/skill-imagens-equipamentos.md:13-19`). A aplicação foi restringida ao Supabase local em ADR-004:30; o script da skill não foi executado nesta entrega.

## 5. O subagente verificador

- **Gatilho:** `rules/spec-flow.md` exige parecer antes de marcar a spec pronta; o hook chama o portão e o workflow `spec-gate` o executa em push/PR (`EmpresTI/rules/spec-flow.md:22-29`; `.githooks/pre-commit:1-5`; `.github/workflows/spec-gate.yml:1-21`). A regra em `AGENTS.md` depende de a pessoa lembrar; o hook/workflow executam o script no evento. O hook local depende de `npm run hooks:install`; a garantia no GitHub depende de tornar o check obrigatório (`EmpresTI/scripts/README.md:10-13`).
- **O que lê:** `AGENTS.md`, `rules/restrictions.md` e `spec.md`, `plan.md`, `tasks.md`; não herda a conversa (`EmpresTI/agents/verificador-spec.md:18-21`). Lê esses arquivos para reconstruir regras e critérios sem presumir decisões passadas da conversa.
- **O que não pode fazer:** sessão `codex exec --ephemeral --sandbox read-only`; guarda para `DATABASE_URL`/`DIRECT_URL` não locais; remove `SUPABASE_SERVICE_ROLE_KEY` e tokens Vercel do processo (`EmpresTI/scripts/verificar-spec.sh:103-131,169-186`). A garantia de produção é limitada ao que o harness verifica; não afirmo que todas as variáveis do processo sejam removidas.
- **Monolito:** ADR-001 define um repositório/aplicação; o verificador cobre CA `[front]` e `[back]` no mesmo repositório (`EmpresTI/docs/adr/001-stack.md:1-16`; `EmpresTI/agents/verificador-spec.md:27-33`).

## 6. O verificador em ação

### Histórico comunicado durante esta sessão

- Spec 004: a primeira revisão apontou ausência de prova da repetição dos seeds e da renderização das 12 fotos. Foram acrescentadas verificações em `EmpresTI/tests/local-data.mjs:21-32` e `EmpresTI/tests/e2e/prototipo.spec.mjs:35-50`; a execução final de `npm run test:spec` passou.
- Spec 005: primeiras tentativas não conseguiram iniciar/verificar o E2E no sandbox do verificador. Foram adicionados testes identificados por CA em `EmpresTI/tests/e2e/prototipo.spec.mjs:55-96`; depois, `npm run test:e2e` e `npm run test:spec` passaram. `npm run test:loan` passou CA-20…26 e informa rollback em `EmpresTI/tests/loan-rules.mjs:6-10`.
- Essas rodadas foram retornadas na conversa, não salvas sob `docs/specs/*/verificacoes/`. Portanto não há número de rodada ou hash de código que eu possa afirmar como evidência arquivada.

### Tabelas de critérios observadas nos testes

**Spec 004 — dados iniciais** (`EmpresTI/docs/specs/004-dados-iniciais/spec.md:12-14`)

| CA | evidência do teste | resultado observado |
|---|---|---|
| CA-17 | `EmpresTI/tests/local-data.mjs:21-32` | ATENDIDO — seed repetido; 12 itens e IDs preservados |
| CA-18 | `EmpresTI/tests/local-data.mjs:34-35` | ATENDIDO — 3 acessórios e 3 itens em manutenção |
| CA-19 | `EmpresTI/tests/e2e/prototipo.spec.mjs:35-50`; `EmpresTI/tests/local-data.mjs:38-47` | ATENDIDO — 12 cards com imagens e arquivos locais 800×600 |

**Spec 005 — solicitar empréstimo** (`EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:23-29`)

| CA | evidência do teste | resultado observado |
|---|---|---|
| CA-20 | `EmpresTI/tests/e2e/prototipo.spec.mjs:55-79`; `EmpresTI/tests/sql/loan-rules.sql:47` | ATENDIDO — pedido e prazo de 14 dias |
| CA-21 | `EmpresTI/tests/e2e/prototipo.spec.mjs:82-84`; `EmpresTI/tests/sql/loan-rules.sql:97` | ATENDIDO — manutenção bloqueada e motivo visível |
| CA-22 | `EmpresTI/tests/e2e/prototipo.spec.mjs:86-93`; `EmpresTI/tests/sql/loan-rules.sql:119` | ATENDIDO — limite de cinco e motivo visível |
| CA-23 | `EmpresTI/tests/sql/loan-rules.sql:82` | ATENDIDO — atraso bloqueia nova solicitação |
| CA-24 | `EmpresTI/tests/e2e/prototipo.spec.mjs:95-96`; `EmpresTI/tests/sql/loan-rules.sql:48` | ATENDIDO — lista e data prevista |
| CA-25 | `EmpresTI/tests/sql/loan-rules.sql:63` | ATENDIDO — no máximo um empréstimo aberto por equipamento |
| CA-26 | `EmpresTI/tests/sql/loan-rules.sql:49` | ATENDIDO — isolamento por usuário e tenant |

Os resultados acima refletem as saídas locais observadas. **Não são substitutos dos relatórios exigidos pelo portão:** o código testado ainda não tem commit e não existem `rodada-NN.md`; o hash válido para esses resultados é **PENDENTE**. A tentativa de plantar um erro, guardar a tabela do verificador e desfazer o erro em dois commits também não foi feita; não há hashes para essa prova.

## 7. Uma regra sua que esta prática pôs à prova

O fluxo de spec exige relatório arquivado com `Veredito: PRONTA` e commit verificado antes de trocar o status (`EmpresTI/rules/spec-flow.md:25-29`). Os verificadores devolveram pareceres PRONTA na conversa, mas as specs 004 e 005 continuam `RASCUNHO` e as tarefas T4 ainda estão sem marcação (`EmpresTI/docs/specs/004-dados-iniciais/spec.md:3`; `EmpresTI/docs/specs/004-dados-iniciais/tasks.md:6-9`; `EmpresTI/docs/specs/005-solicitar-emprestimo/spec.md:3`; `EmpresTI/docs/specs/005-solicitar-emprestimo/tasks.md:9-13`). Mantive esse estado: a regra exige prova persistida, não apenas um resultado verbal.

## 8. O que ficou de fora e o que faria diferente

- **Produção:** nada foi publicado na Vercel ou em Supabase remoto. A entrega comprovada é local (`EmpresTI/docs/adr/004-supabase-local-data.md:26-30`).
- **Proteção de branch:** o workflow existe, mas não foi verificado se `Spec gate / verify` está configurado como check obrigatório no GitHub; essa configuração é condição documentada do portão (`EmpresTI/scripts/README.md:10-13`).
- **Conta real:** Auth local e tela de cadastro foram exercitados, mas não criei conta nem testei login com suas credenciais. O auto cadastro conflita com Spec 002, que ainda o exclui (`EmpresTI/docs/specs/002-acesso/spec.md:13,27-28`). Eu registraria essa decisão na spec antes de dizer que ela está resolvida.
- **Front-end publicado:** o repositório contém tanto `index.html`/`app.js` na raiz quanto `EmpresTI/front/prototipo/`; o ZIP anexado também traz esse protótipo antigo. Os testes e `scripts/serve.mjs` usam a aplicação da raiz, mas não foi verificada a configuração efetiva de Vercel. Não afirmo que produção use esse diretório (`EmpresTI/scripts/serve.mjs:1-14`; `EmpresTI/front/prototipo/app.js:136-154`).
- **Cadastro de equipamento:** a spec 003 usa `TI-0000`, mas o formulário da aplicação raiz ainda contém validação e placeholders `PAT-0000` (`EmpresTI/docs/specs/003-operacoes/spec.md:16,24`; `app.js:561,575-576`; `index.html:349`). Essa tela de Operações ficou fora das Entregas 3 e 4; não conto o cadastro como concluído.
- **PostgreSQL 16:** a configuração do Supabase local está em major version 17 (`EmpresTI/supabase/config.toml:42`). As migrations foram aplicadas/testadas no Supabase local, mas não há evidência de teste em Postgres 16.
- **Crédito visual:** não aparece na interface por decisão registrada; a instrução da skill ainda pede esse crédito (`EmpresTI/skills/imagens-equipamentos/SKILL.md:31`; `EmpresTI/docs/adr/005-fotos-pixabay.md:11-13`). Eu alinharia a skill à decisão antes de reutilizá-la em outra entrega.
- **Verificação persistida e commits:** falta salvar as rodadas finais em `verificacoes/rodada-NN.md`, completar T4, fazer commits rastreáveis e só então usar o portão para declarar specs PRONTAS. As mudanças da Entrega 3/4 ainda aparecem não commitadas no `git status`; `47a6a07` não é hash delas.
- **Origem das fotos:** há 12 registros de crédito com fonte Pixabay e imagens acessíveis no Storage local; não há log no repositório que prove quando a API foi consultada. Não atribuo ao ZIP nem a `47a6a07` uma execução de rede.
- **Arquivo duplicado:** há um rascunho antigo não rastreado em `EmpresTI/ENTREGA.md`. Este arquivo na raiz Git é a cópia canônica indicada para a entrega; não misture os dois textos.

O que eu faria diferente: antes de implementar, fecharia na spec 002 a decisão de cadastro aberto versus convite; depois manteria uma única cópia do protótipo como fonte para servir/publicar. E deixaria a prova de erro plantado e os relatórios finais para depois que o código estivesse commitado, para que cada resultado apontasse a um hash verificável.
