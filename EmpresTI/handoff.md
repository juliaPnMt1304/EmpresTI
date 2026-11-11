# Handoff — 05/11/2026

1. Onde parei: reorganização do repositório conforme as aulas 9–11. Nenhuma tarefa de spec em
   andamento; T0 (protótipo) das specs 001–003 está feita e testada.
2. Commitado: nada (pacote entregue sem `.git`). Branch a definir pelo operador.
3. Aplicado no banco local, não commitado: nada. A migration `0001_init` foi aplicada só em um
   Postgres 16 descartável para teste; `0002` é proposta, não aplicada.
4. Publicado: nada. Não houve push nem deploy.
5. NÃO fazer na próxima sessão:
   - não gerar a migration `0002` sem aprovar o DDL (`rules/migration.md`);
   - não criar o app Next.js sem mostrar o que o scaffold gera (`rules/restrictions.md`);
   - não reutilizar o `.env` do zip anterior: a `SUPABASE_SERVICE_ROLE_KEY` dele foi exposta e
     precisa ser rotacionada no painel do Supabase.
6. Não verificado nesta revisão (ambiente sem acesso ao engine do Prisma): `npm run db:validate`,
   `npm run typecheck`, `npm run db:migrate:deploy` e `npm run db:check`. Rode-os e cole a saída.
7. Próximo passo: aprovar ou ajustar as 3 specs e o DDL da `0002`, depois executar T1 da spec 001.
