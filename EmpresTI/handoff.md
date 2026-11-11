# Handoff — 11/11/2026

1. Onde parei: scripts de preparo/publicação e auditoria da skill `imagens-equipamentos`; não há T/CA associado nas specs 001–003.
2. Commitado: HEAD `8f992b2` na branch `main`; alterações desta tarefa não commitadas.
3. Estado do banco local: nada aplicado ou alterado nesta tarefa.
4. Publicado: nada. Não houve acesso ao Supabase, push ou deploy.
5. Próxima sessão NÃO deve executar `npm run imagens:publicar` até haver 12 fotos preparadas e revisadas e decisão humana explícita.
6. O publicador exige TTY e confirmação `PUBLICAR`, mas TTY não prova identidade humana; `--aprovar` também não comprova a revisão visual.
7. Não verificado: Pixabay com chave real, bucket/permissões/POST no Supabase e crédito na tela do produto.
8. `data/imagens/creditos.json` não existe neste checkout; testes usaram arquivos e dados temporários.
9. A suíte local `npm run test:imagens` passou: 12 testes, sem rede.
10. Próximo passo: preparar as imagens com autorização e chave via terminal, revisar visualmente cada uma e só então decidir sobre a publicação manual.
