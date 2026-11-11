#!/usr/bin/env bash
set -euo pipefail

# Uso: bash scripts/verificar-spec.sh NNN (ex.: 001).
# Exige árvore limpa; executa o verificador em sessão Codex efêmera/read-only
# e deixa o próprio script salvar a resposta na próxima rodada da spec.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
cd -- "$PROJECT_DIR"

usage(){
  printf 'Uso: %s NNN (ex.: 001)\n' "${0##*/}" >&2
  exit 2
}

[[ $# -eq 1 && "$1" =~ ^[0-9]{3}$ ]] || usage
spec_number="$1"

GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'Erro: não foi possível localizar a raiz Git.\n' >&2
  exit 2
}
if [[ -n "$(git -C "$GIT_ROOT" status --porcelain)" ]]; then
  printf 'Erro: a árvore de trabalho está suja. Faça commit ou stash antes de verificar a spec.\n' >&2
  exit 1
fi

spec_files=("$PROJECT_DIR"/docs/specs/"$spec_number"-*/spec.md)
matching_specs=()
for spec_file in "${spec_files[@]}"; do
  [[ -f "$spec_file" ]] && matching_specs+=("$spec_file")
done
if (( ${#matching_specs[@]} != 1 )); then
  printf 'Erro: esperado exatamente um docs/specs/%s-*/spec.md; encontrados %s.\n' \
    "$spec_number" "${#matching_specs[@]}" >&2
  exit 1
fi
spec_file="${matching_specs[0]}"
spec_dir="${spec_file%/spec.md}"
verification_dir="$spec_dir/verificacoes"

shopt -s nullglob
reports=("$verification_dir"/rodada-*.md)
latest_report=''
latest_round=0
for report in "${reports[@]}"; do
  [[ -f "$report" ]] || continue
  report_name="${report##*/}"
  if [[ "$report_name" =~ ^rodada-([0-9]{2,})\.md$ ]]; then
    round_number=$((10#${BASH_REMATCH[1]}))
    if (( round_number > latest_round )); then
      latest_round=$round_number
      latest_report="$report"
    fi
  fi
done
next_round=$((latest_round + 1))
printf -v round_label '%02d' "$next_round"
output_report="$verification_dir/rodada-$round_label.md"
if [[ -e "$output_report" ]]; then
  printf 'Erro: o relatório de destino já existe: %s\n' "$output_report" >&2
  exit 1
fi

current_head="$(git -C "$GIT_ROOT" rev-parse HEAD)"
current_short="$(git -C "$GIT_ROOT" rev-parse --short HEAD)"
if [[ -n "$latest_report" ]]; then
  previous_hash="$(sed -nE 's/^Commit verificado: ([[:xdigit:]]+)([[:space:]].*)?$/\1/p' "$latest_report" | sed -n '1p')"
  if [[ -z "$previous_hash" ]] || ! previous_commit="$(git -C "$GIT_ROOT" rev-parse --verify "${previous_hash}^{commit}" 2>/dev/null)"; then
    printf 'Erro: a última rodada não contém um commit verificado válido.\n' >&2
    exit 1
  fi
  if ! git -C "$GIT_ROOT" merge-base --is-ancestor "$previous_commit" "$current_head"; then
    printf 'Erro: o commit verificado na rodada anterior não é ancestral do HEAD.\n' >&2
    exit 1
  fi
  commit_interval="$previous_hash..HEAD"
else
  first_commit="$(git -C "$GIT_ROOT" rev-list --max-parents=0 HEAD | sed -n '1p')"
  commit_interval="todos os commits desde $first_commit até HEAD (inclusive)"
fi

read_dotenv_value(){
  local file="$1" key="$2" line value
  [[ -f "$file" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*= ]] || continue
    value="${line#*=}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    if [[ "$value" == \"*\" && ${#value} -ge 2 ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && ${#value} -ge 2 ]]; then
      value="${value:1:${#value}-2}"
    fi
    printf '%s' "$value"
    return 0
  done < "$file"
}

check_db_url(){
  local name="$1" value="$2" host
  [[ -n "$value" ]] || return 0
  if [[ "$value" =~ ^[[:alpha:]][[:alnum:].+-]*://([^/@]*@)?([^/:?#]+) ]]; then
    host="${BASH_REMATCH[2],,}"
  else
    printf 'Erro: %s existe, mas seu host não pôde ser validado; verificador não será iniciado.\n' "$name" >&2
    return 1
  fi
  case "$host" in
    localhost|127.0.0.1) ;;
    *)
      printf 'Erro: %s aponta para um host não local; verificador não será iniciado.\n' "$name" >&2
      return 1
      ;;
  esac
}

for variable in DATABASE_URL DIRECT_URL; do
  case "$variable" in
    DATABASE_URL) value="${DATABASE_URL-}" ;;
    DIRECT_URL) value="${DIRECT_URL-}" ;;
  esac
  check_db_url "$variable" "$value"
  for dotenv_file in "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.local"; do
    dotenv_value="$(read_dotenv_value "$dotenv_file" "$variable")"
    check_db_url "$variable ($dotenv_file)" "$dotenv_value"
  done
done

if ! command -v codex >/dev/null 2>&1; then
  printf 'Erro: codex CLI não encontrado no PATH.\n' >&2
  exit 127
fi

agent_instructions="$PROJECT_DIR/agents/verificador-spec.md"
if [[ ! -f "$agent_instructions" ]]; then
  printf 'Erro: instruções do verificador não encontradas: %s\n' "$agent_instructions" >&2
  exit 1
fi

temp_base="${TMPDIR:-/tmp}"
temp_base="$(cd -- "$temp_base" && pwd)"
temp_dir="$(mktemp -d "$temp_base/empresti-verificar-spec.XXXXXX")"
cleanup(){
  case "$temp_dir" in
    "$temp_base"/empresti-verificar-spec.*)
      rm -f -- "$temp_dir/prompt.txt" "$temp_dir/relatorio.md" "$temp_dir/codex.stderr"
      rmdir -- "$temp_dir" 2>/dev/null || true
      ;;
  esac
}
trap cleanup EXIT

cat "$agent_instructions" > "$temp_dir/prompt.txt"
cat >> "$temp_dir/prompt.txt" <<EOF


ENTRADA DESTA RODADA
Spec: docs/specs/${spec_number}-*/spec.md (arquivo correspondente: ${spec_file#"$PROJECT_DIR"/})
Intervalo de commits a verificar: ${commit_interval}
Commit verificado desta execução: ${current_short}
Use exatamente esse hash no campo `Commit verificado` do relatório.
Rodada: ${round_label}

Restrições adicionais: não escreva nem altere arquivos. Não rode migration, push, deploy,
nem acesse ou altere o Supabase remoto. Execute os testes em sandbox somente leitura.
Se um teste precisar gravar, reporte a falha e proponha liberar apenas uma pasta temporária;
não peça nem use permissão de escrita para o repositório.
EOF

unset_names=(SUPABASE_SERVICE_ROLE_KEY)
while IFS= read -r environment_name; do
  case "$environment_name" in
    VERCEL_*TOKEN*) unset_names+=("$environment_name") ;;
  esac
done < <(compgen -e)
env_arguments=(env)
for environment_name in "${unset_names[@]}"; do
  env_arguments+=(-u "$environment_name")
done

set +e
"${env_arguments[@]}" codex exec --ephemeral --sandbox read-only --color never \
  -o "$temp_dir/relatorio.md" - < "$temp_dir/prompt.txt" 2> "$temp_dir/codex.stderr"
codex_status=$?
set -e

if [[ -s "$temp_dir/relatorio.md" ]]; then
  mkdir -p -- "$verification_dir"
  cp -- "$temp_dir/relatorio.md" "$output_report"
  printf 'Relatório salvo em %s\n' "${output_report#"$PROJECT_DIR"/}"
elif (( codex_status == 0 )); then
  printf 'Erro: codex exec terminou sem produzir relatório.\n' >&2
  codex_status=1
fi

if (( codex_status != 0 )) && [[ -s "$temp_dir/codex.stderr" ]]; then
  cat "$temp_dir/codex.stderr" >&2
fi
exit "$codex_status"
