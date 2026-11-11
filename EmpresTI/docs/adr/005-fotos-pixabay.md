# 005 — Fotos do Pixabay no catálogo

## Contexto

ADR-002 definiu catálogo sem fotografia. A decisão posterior do projeto pede imagens do Pixabay
para os 12 equipamentos, já preparadas e revisadas em 800×600. O briefing também pede crédito na
tela; a responsável decidiu que o crédito visível não é necessário nesta entrega.

## Decisão

Usar as imagens aprovadas do Pixabay no Storage do Supabase e persistir a URL no equipamento.
Não exibir crédito na interface desta entrega; os créditos e licença permanecem registrados em
`data/imagens/creditos.json`. Esta decisão substitui apenas a regra de fotografia do ADR-002.

## Alternativas descartadas

| Alternativa | Motivo |
|---|---|
| Manter placeholders | Não atende ao pedido de fotos no catálogo. |
| Exibir crédito na tela | A responsável decidiu que não é necessário nesta entrega. |
| Buscar imagens do Pixabay no navegador | Evita hotlink e mantém o catálogo estável com arquivos no Storage. |

## Consequências

- Os cards exibem arquivos locais do Storage; a atribuição é mantida nos metadados do projeto.
- A revisão visual humana existente continua sendo o critério para aprovar fotos.

## O que este ADR não decide

- Posição de créditos se a interface voltar a exibi-los, produção ou imagens futuras.
