# Plano — Spec 004

- Usar Prisma Migrate e seeds idempotentes separados para tenant e equipamentos.
- Criar bucket público `equipamentos` pela migration local e carregar somente as 12 imagens aprovadas.
- Usar o front estático existente com o cliente Supabase, conforme ADR-004 e ADR-005.
- Testar contagem, categorias, estados e URLs no Supabase local e validar a grade no navegador.
