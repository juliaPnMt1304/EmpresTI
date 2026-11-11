#!/usr/bin/env bash
set -euo pipefail

# Uso: bash scripts/check-spec-verified.sh
# Bloqueia specs PRONTAS sem relatório aprovado da rodada mais recente,
# commit verificado ancestral do HEAD e sem alterações externas à spec/relatório.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
GIT_ROOT="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'Spec gate: não foi possível localizar a raiz Git.\n' >&2
  exit 2
}
PROJECT_PREFIX="$(git -C "$PROJECT_DIR" rev-parse --show-prefix)"
if [[ -n "$PROJECT_PREFIX" ]]; then
  PROJECT_PREFIX="${PROJECT_PREFIX%/}/"
fi
HEAD_COMMIT="$(git -C "$GIT_ROOT" rev-parse HEAD)"

shopt -s nullglob
SPEC_FILES=("$PROJECT_DIR"/docs/specs/*/spec.md)
ready_count=0
failed=0

fail_spec(){
  printf 'FAIL: %s — %s\n' "$1" "$2" >&2
  failed=1
}

for spec_file in "${SPEC_FILES[@]}"; do
  [[ -f "$spec_file" ]] || continue
  grep -Fxq 'Status: PRONTA' "$spec_file" || continue
  ready_count=$((ready_count + 1))

  spec_dir="${spec_file%/spec.md}"
  spec_name="${spec_dir##*/}"
  verification_dir="$spec_dir/verificacoes"
  reports=("$verification_dir"/rodada-*.md)
  latest_report=''
  latest_round=-1

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

  if [[ -z "$latest_report" ]]; then
    fail_spec "docs/specs/$spec_name/spec.md" 'não existe relatório rodada-NN.md'
    continue
  fi

  if ! grep -Fxq 'Veredito: PRONTA' "$latest_report"; then
    fail_spec "docs/specs/$spec_name/spec.md" "$(basename "$latest_report") não contém 'Veredito: PRONTA'"
    continue
  fi

  verified_hash="$(sed -nE 's/^Commit verificado: ([[:xdigit:]]+)([[:space:]].*)?$/\1/p' "$latest_report" | head -n 1)"
  if [[ -z "$verified_hash" ]]; then
    fail_spec "docs/specs/$spec_name/spec.md" "$(basename "$latest_report") não contém 'Commit verificado: <hash curto>'"
    continue
  fi

  if ! verified_commit="$(git -C "$GIT_ROOT" rev-parse --verify "${verified_hash}^{commit}" 2>/dev/null)"; then
    fail_spec "docs/specs/$spec_name/spec.md" "commit verificado '$verified_hash' não existe"
    continue
  fi

  if ! git -C "$GIT_ROOT" merge-base --is-ancestor "$verified_commit" "$HEAD_COMMIT"; then
    fail_spec "docs/specs/$spec_name/spec.md" "commit verificado '$verified_hash' não é ancestral do HEAD"
    continue
  fi

  allowed_spec="${PROJECT_PREFIX}docs/specs/$spec_name/spec.md"
  allowed_reports="${PROJECT_PREFIX}docs/specs/$spec_name/verificacoes/"
  unexpected_paths=()
  while IFS= read -r -d '' changed_path; do
    if [[ "$changed_path" != "$allowed_spec" && "$changed_path" != "$allowed_reports"* ]]; then
      unexpected_paths+=("$changed_path")
    fi
  done < <(git -C "$GIT_ROOT" diff --name-only -z "$verified_commit" --)

  if (( ${#unexpected_paths[@]} > 0 )); then
    printf 'FAIL: docs/specs/%s/spec.md — arquivos alterados fora da spec e verificacoes:\n' "$spec_name" >&2
    printf '  %s\n' "${unexpected_paths[@]}" >&2
    failed=1
  else
    printf 'PASS: docs/specs/%s/spec.md — %s\n' "$spec_name" "$(basename "$latest_report")"
  fi
done

if (( ready_count == 0 )); then
  printf 'Spec gate: nenhuma spec com Status: PRONTA.\n'
  exit 0
fi

exit "$failed"
