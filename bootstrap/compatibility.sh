#!/usr/bin/env bash
# Phase 0 (legacy) — delegates to preflight.sh for backward compatibility
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "${SCRIPT_DIR}/preflight.sh" "$@"
