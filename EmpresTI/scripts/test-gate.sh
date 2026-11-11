#!/usr/bin/env bash
set -euo pipefail

# Uso: bash scripts/test-gate.sh
# Exercita o portão em um repositório Git temporário; não escreve no projeto.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
GATE_SOURCE="$SCRIPT_DIR/check-spec-verified.sh"
[[ -f "$GATE_SOURCE" ]] || { printf 'Não encontrado: %s\n' "$GATE_SOURCE" >&2; exit 1; }

temp_base="${TMPDIR:-/tmp}"
temp_base="$(cd -- "$temp_base" && pwd)"
temp_root="$(mktemp -d "$temp_base/empresti-test-gate.XXXXXX")"
touch "$temp_root/.test-owned"
cleanup(){
  case "$temp_root" in
    "$temp_base"/empresti-test-gate.*)
      if [[ -f "$temp_root/.test-owned" ]]; then
        rm -rf -- "$temp_root"
      fi
      ;;
  esac
}
trap cleanup EXIT

repo="$temp_root/repo"
mkdir -p "$repo/scripts" "$repo/docs/specs/999-ficticia"
cp "$GATE_SOURCE" "$repo/scripts/check-spec-verified.sh"
git -C "$repo" init -q
git -C "$repo" config user.name 'Spec gate test'
git -C "$repo" config user.email 'spec-gate-test@example.invalid'

cat > "$repo/README.md" <<'EOF'
Fixture isolada do teste do spec gate.
EOF
cat > "$repo/docs/specs/999-ficticia/spec.md" <<'EOF'
# Spec fictícia para teste local
Status: PRONTA
EOF
git -C "$repo" add README.md docs/specs/999-ficticia/spec.md
git -C "$repo" commit -q -m 'test fixture baseline'
verified_commit="$(git -C "$repo" rev-parse --short HEAD)"

if bash "$repo/scripts/check-spec-verified.sh" > "$temp_root/output.txt" 2>&1; then
  cat "$temp_root/output.txt"
  printf 'FALHA: o portão aceitou uma spec PRONTA sem relatório.\n' >&2
  exit 1
else
  missing_report_status=$?
fi
if (( missing_report_status != 1 )) || ! grep -Fq 'docs/specs/999-ficticia/spec.md' "$temp_root/output.txt"; then
  cat "$temp_root/output.txt" >&2
  printf 'FALHA: a ausência do relatório não foi rejeitada como esperado.\n' >&2
  exit 1
fi
printf 'PASS: spec PRONTA sem relatório retorna exit 1.\n'

mkdir -p "$repo/docs/specs/999-ficticia/verificacoes"
cat > "$repo/docs/specs/999-ficticia/verificacoes/rodada-01.md" <<EOF
Commit verificado: $verified_commit · Data: 2026-11-10
Veredito: PRONTA
EOF
git -C "$repo" add docs/specs/999-ficticia/verificacoes/rodada-01.md

if bash "$repo/scripts/check-spec-verified.sh" > "$temp_root/output.txt" 2>&1; then
  cat "$temp_root/output.txt"
  printf 'PASS: relatório válido retorna exit 0.\n'
else
  status=$?
  cat "$temp_root/output.txt" >&2
  printf 'FALHA: relatório válido retornou exit %s.\n' "$status" >&2
  exit 1
fi
