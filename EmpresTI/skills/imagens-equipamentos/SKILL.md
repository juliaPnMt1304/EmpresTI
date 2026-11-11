---
name: imagens-equipamentos
description: Use ao preparar imagens de equipamentos para o EmpresTI. Não use para landing pages, logos, ilustrações ou alterações em banco de dados.
---

## Precedência
Esta skill orienta; não decide. Em conflito, valem `rules/` e `docs/adr/`. Pare e avise.

# Imagens de equipamentos

Orienta a preparação de fotos para os equipamentos listados em `equipamentos.json`. Esta skill não contém scripts nesta etapa.

## Fluxo

1. **Preparar:** buscar fotos somente pela API do Pixabay e preparar os arquivos locais conforme os requisitos abaixo.
2. **Revisão humana:** apresentar as imagens e seus dados para a pessoa responsável revisar. Foto reprovada não segue adiante.
3. **Publicar:** somente uma pessoa pode aprovar e publicar as fotos no sistema. A skill e seus scripts não publicam.

## Requisitos e responsáveis

| Requisito | Quem garante |
|---|---|
| Fonte | Instrução e script futuro: buscar exclusivamente pela API do Pixabay. |
| Direito de imagem | Humano: avaliar a licença aplicável e reprovar conteúdo inadequado; a consulta à API, por si só, não substitui essa revisão. |
| Mesmo tamanho | Script futuro com `sharp`, conforme ADR-003: gerar imagens em 800×600. |
| Sem repetição | Script futuro: impedir reutilização do mesmo ID do Pixabay ou da mesma imagem em mais de um equipamento. |
| Créditos | Script futuro: conservar os campos de identificação e autoria retornados pela API, incluindo `id`, `pageURL`, `user` e `user_id`. |
| Armazenamento | Script futuro: baixar as imagens para processamento local em `imagens-build/`; não usar URL do Pixabay como hotlink permanente. A publicação depende de aprovação humana. |
| Produção | Humano: decidir e executar a publicação depois da revisão. |
| Segredos e dependências | Instrução: não expor a chave. `sharp` só pode ser `devDependency` e usado em `skills/*/scripts/`, conforme ADR-003. Humano: fornecer a chave pelo ambiente do terminal, nunca em código, log ou Git. |
| Crédito na tela | Humano, conforme a spec: a tela que exibe as fotos mostra “Fotos: Pixabay” com link para https://pixabay.com. A localização do crédito é decidida na spec. |

Os responsáveis marcados como script futuro descrevem os controles esperados; os scripts ainda não foram criados.

## Proibições

- Não usar outra fonte de imagens além da API do Pixabay.
- Não enviar imagens ou dados ao Supabase.
- Não aprovar uma foto em lugar da revisão humana.
- Nunca colocar a chave em código, log ou Git.
- Não adicionar biblioteca além das permitidas pelos ADRs. Para processamento de imagem, ADR-003 permite somente `sharp` como dependência de desenvolvimento e restrita a scripts em `skills/*/scripts/`; não importar em `src/` nem incluir no bundle da Vercel.
