# Spec 002 — Login e perfis

> Status: **RASCUNHO para aprovação do time.** CA derivados do PRD (item 1 e "Quem usa").

## Objetivo
Cada pessoa entra com e-mail e senha, vê só o que o seu perfil permite e encerra a sessão.

## Vínculo
- PRD: item 1 (login; cada pessoa vê os próprios empréstimos) e "Quem usa" (Colaborador × Operações).
- ADR-001 §7 (autenticação e autorização). Tela #s1 (`docs/layout.md`).

## Regras
- Cadastro fechado; usuário entra por convite de administrador (ADR-001 §7).
- Papel real é `memberships.role` (`ADMIN` = Operações, `MEMBER` = colaborador), imposto no
  servidor. A interface só decide o que mostrar.
- A sessão nunca vai para `localStorage`/`sessionStorage`.

## Critérios de aceitação
| ID | Lado | Critério |
|----|------|----------|
| CA-08 | [front][back] | Sem sessão só a tela de login é acessível; qualquer rota interna redireciona para ela. Com sessão, o login leva ao catálogo. |
| CA-09 | [front] | Campos vazios, e-mail inválido e credenciais erradas mostram mensagem específica, sem expor detalhe do servidor. |
| CA-10 | [front][back] | Colaborador não acessa as telas de Operações; o perfil vem de `app_metadata` (definido só pelo servidor), nunca de `user_metadata`; nome/e-mail vindos do token são escapados. |
| CA-11 | [front] | A sessão vive só em memória (protótipo) / cookie `httpOnly` (app); "Sair" encerra a sessão e volta ao login. |
| CA-16 | [back] | Chamada tRPC de Operações por colaborador é recusada no servidor (não só escondida na tela). |

## Fora de escopo
Auto cadastro, recuperação de senha, convite de usuário (provisionamento é decisão em aberto no ADR-001).

## Contrato afetado
Supabase Auth; `users`, `memberships`; contexto tRPC (`createContext`) e `protectedProcedure`/`tenantProcedure`.

## Perguntas em aberto
1. Quem convida usuários e como o papel `ADMIN` é concedido (ADR-001 "não decide")?
2. Política de senha e de bloqueio por tentativas (o rate limit por IP/usuário está no ADR-001 §10).
