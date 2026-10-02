#!/usr/bin/env bash
set -euo pipefail
cloud_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$cloud_root"
exec npm run dev -- --hostname 0.0.0.0
