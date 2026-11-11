---
name: imagens-equipamentos
description: Use ao preparar, revisar e publicar imagens de equipamentos para o EmpresTI. Não use para landing pages, logos, ilustrações ou alterações em banco de dados.
---

## Precedência
Esta skill orienta; não decide. Em conflito, valem `rules/` e `docs/adr/`. Pare e avise.

# Imagens de equipamentos

Prepara fotos para os itens de `equipamentos.json`, oferece uma página para revisão e fornece um comando de publicação manual.

## Fluxo

1. **Preparar:** buscar exclusivamente pela API do Pixabay e salvar as imagens localmente.
2. **Revisão humana:** revisar fotos e metadados em `imagens-build/revisao.html`; aprovar ou reprovar cada item. O flag de aprovação grava os dados informados, mas não comprova quem revisou.
3. **Publicar:** uma pessoa executa o comando em terminal interativo, confere a lista e digita `PUBLICAR`. O script envia somente depois dessas etapas; a exigência de TTY não comprova identidade humana.

## Requisitos e responsáveis

| Requisito | Quem garante |
|---|---|
| Fonte | Instrução e `preparar.mjs`: consulta à API do Pixabay; `hostPermitido` restringe URLs de imagem ao HTTPS em `pixabay.com` e subdomínios. |
| Direito de imagem | Humano: revisar a foto e aplicar o checklist; `tagsProibidas` é apenas um filtro auxiliar de tags. |
| Mesmo tamanho | `redimensionar` produz JPEG em 800×600; `dimensaoOk` e `validarArquivos` conferem o arquivo final. |
| Sem repetição | `preparar.mjs` evita IDs e hashes repetidos; `validarArquivos` bloqueia ID ou hash repetido antes de publicar. |
| Créditos | `preparar.mjs` grava metadados Pixabay e `makeReview` os mostra; `publicar.mjs` grava a URL pública depois dos envios concluídos. |
| Armazenamento | `preparar.mjs` guarda os JPEGs localmente; `publicar.mjs` verifica bucket e envia com `x-upsert: true`. |
| Produção | Humano inicia em TTY e digita `PUBLICAR`; o script não consegue provar identidade humana. |
| Segredos e dependências | `publicar.mjs` lê as credenciais Supabase apenas de `process.env`; `sharp` é `devDependency` e só é importado por código em `skills/*/scripts/`. A origem humana do ambiente é convenção, não verificação do código. |
| Crédito na tela | A skill exige “Fotos: Pixabay” com link; a spec define a posição. A tela da aplicação precisa implementar essa instrução. |

## Proibições

- Não usar fonte de imagens fora da API do Pixabay.
- Não enviar imagens ao Supabase antes de revisão, validações, bucket público e confirmação interativa.
- Não usar script para substituir a revisão visual humana.
- Não colocar chaves em código, logs ou Git.
- Não adicionar biblioteca além das autorizadas nos ADRs. `sharp` fica limitado a `devDependency` e `skills/*/scripts/`, sem import em `src/` ou no bundle da Vercel.
