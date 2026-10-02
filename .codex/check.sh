#!/usr/bin/env bash
set -euo pipefail
cloud_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$cloud_root"
export CI=true
export NEXT_TELEMETRY_DISABLED=1
export ENVIRONMENT=test
export MPLBACKEND=Agg
python3 .codex/verify.py
cloud_status=0
cloud_run() {
  printf "%s\n" "Running: $1"
  if bash -c "$1"; then return 0; else cloud_status=1; fi
}
cloud_run 'npx --no-install tsc --noEmit'
cloud_run 'npm run build'
printf "%s\n" "No isolated application test suite is configured for this snapshot; see CLOUD_DEVELOPMENT.md."
exit "$cloud_status"
