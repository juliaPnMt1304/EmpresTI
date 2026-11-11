# 003 — Sharp nos scripts de skills

## 1. Contexto

A skill `imagens-equipamentos` precisa garantir imagens em 800×600. A API do Pixabay não oferece corte por URL. O briefing de dados iniciais pede a instalação de `sharp`, enquanto `rules/restrictions.md` exige que uma biblioteca esteja aprovada em ADR antes de ser escolhida.

## 2. Decisão

Adotar `sharp` exclusivamente como `devDependency`, para uso por scripts em `skills/*/scripts/`. É proibido importar `sharp` de `src/` ou incluí-lo no bundle da Vercel. A biblioteca não será instalada como parte deste ADR.

## Alternativas descartadas

| Alternativa | Motivo do descarte |
|---|---|
| Canvas via Playwright | Exigiria usar um navegador automatizado para uma transformação de imagem que pode ser feita diretamente por um script. |
| Jimp, biblioteca em JavaScript puro | Não foi escolhida: a decisão aprova `sharp` para esse processamento e restringe seu uso aos scripts da skill. |
| Aceitar imagens sem redimensionar | Não garante o requisito de saída em 800×600. |
| Trocar de API | Não é necessário para atender ao requisito: o redimensionamento ficará a cargo do processamento local com `sharp`. |

## Consequências

- Os scripts da skill poderão produzir imagens em 800×600 sem depender do corte pela URL do Pixabay.
- `sharp` será dependência de desenvolvimento; seu uso fica limitado a `skills/*/scripts/`.
- O código em `src/` e o bundle da Vercel não poderão depender de `sharp`.
- A instalação e os scripts que usarão a biblioteca são mudanças de implementação separadas; este ADR não as executa.

## O que este ADR não decide

- O fluxo, as entradas e as saídas dos scripts da skill `imagens-equipamentos`.
- O tratamento de proporção, enquadramento, formatos, qualidade ou metadados das imagens.
- A instalação efetiva de `sharp` ou a implementação dos scripts.
- A configuração da API do Pixabay ou o uso de outra fonte de imagens.
