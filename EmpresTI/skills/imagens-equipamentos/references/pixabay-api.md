# Pixabay API — referência para a skill

Base de busca: `https://pixabay.com/api/`. A API retorna JSON. A chave é obrigatória no parâmetro `key`; não a grave em arquivos versionados, URLs registradas em logs ou código.

## Parâmetros usados

- `q`: termo de busca, codificado para URL.
- `image_type=photo`: somente fotografias.
- `safesearch=true`: restringe resultados a conteúdo adequado para todas as idades, segundo o filtro da API.
- `orientation=horizontal`: imagens horizontais.
- `min_width=800` e `min_height=600`: dimensões mínimas da imagem original retornada; isso não garante saída exatamente em 800×600. O redimensionamento é tratado localmente por `sharp`, conforme ADR-003.
- `per_page`: quantidade de resultados por página. A documentação aceita de 3 a 200.
- `lang`: idioma de busca; a documentação lista `pt` entre os valores aceitos.

## Campos usados de cada resultado

- `id`: identificador da imagem, para controle de duplicidade.
- `pageURL`: página da imagem no Pixabay.
- `tags`: palavras-chave da imagem.
- `user` e `user_id`: identificação do contribuidor, para registro de créditos.
- `largeImageURL`: URL da versão escalada, com dimensão máxima indicada de 1280 px.

## Limites e uso dos arquivos

- Limite padrão documentado: até 100 requisições por 60 segundos por chave.
- A Pixabay exige cache de resultados da API por 24 horas.
- URLs de imagem podem ser usadas temporariamente para exibir resultados de busca. Hotlink permanente no aplicativo não é permitido; baixe a imagem para armazenamento próprio antes de publicá-la.
- Atribua a origem quando exibir resultados da busca. Para fotos usadas no sistema, o contrato desta skill exige o crédito “Fotos: Pixabay” com link para `https://pixabay.com`; a spec decide sua localização na tela.

Fonte: [documentação oficial da Pixabay API](https://pixabay.com/api/docs/).

## Não conferido

Não foi feita chamada real à API, não foi validada uma chave e não foram verificados os resultados para cada termo do catálogo. O limite citado é o padrão publicado; limites específicos de conta não foram consultados. A documentação da API não substitui análise jurídica da licença nem a revisão humana do conteúdo de cada foto.
