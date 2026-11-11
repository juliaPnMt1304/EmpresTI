# Plano — Spec 005

- Supabase Auth local cria perfil e vínculo ao tenant por trigger.
- Supabase RPC `solicitar_emprestimo` aplica limite, atraso, disponibilidade e prazo sob transação.
- RLS limita catálogo e empréstimos à sessão; índice parcial impede empréstimos abertos duplicados.
- A tela estática exibe catálogo e empréstimos do usuário; só acessa configuração pública local.
- Validar no Postgres/Supabase local e no navegador sem credenciais remotas.
