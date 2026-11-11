# Scripts de verificação de specs

## Portão de spec

`check-spec-verified.sh` valida todas as specs com `Status: PRONTA`. Exige que a
rodada mais recente tenha `Veredito: PRONTA`, que o `Commit verificado` exista e
seja ancestral do `HEAD`, e que as únicas alterações desde esse commit sejam o
`spec.md` da própria spec ou arquivos da pasta `verificacoes/`.

O hook local depende de instalar-se com `npm run hooks:install` dentro de
`EmpresTI/`. A garantia real é o workflow **Spec gate** no GitHub: configure o
check obrigatório `Spec gate / verify` na proteção de branch. Sem essa regra,
um push pode contornar o hook local.

## Criar um relatório

Com a árvore limpa, execute `bash scripts/verificar-spec.sh NNN`, por exemplo
`bash scripts/verificar-spec.sh 001`. O script cria a próxima
`docs/specs/NNN-*/verificacoes/rodada-NN.md`, chama o verificador em uma sessão
Codex efêmera com sandbox somente leitura e não permite acesso a banco remoto.
Depois de conferir o relatório, marque a spec pronta e faça o commit apenas das
alterações permitidas pelo portão.

## Teste isolado

Execute `bash scripts/test-gate.sh`. Ele cria um repositório Git temporário,
confirma que uma spec pronta sem relatório retorna `1` e que a mesma spec com
relatório válido retorna `0`; a pasta temporária é removida ao terminar.
