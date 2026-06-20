#!/usr/bin/env bash
# Optional post-install — Browser Development Mode (code-server + Open WebUI)
# Trigger: INSTALL_BROWSER_DEV=1 or bash bootstrap/install.sh --browser-dev
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

BROWSER_DEV_DIR="${REPO_ROOT}/.bootstrap/browser-dev"
CODE_SERVER_PORT="${CODE_SERVER_PORT:-8080}"
OPENWEBUI_PORT="${OPENWEBUI_PORT:-3000}"

trap 'on_phase_error ${LINENO}' ERR

write_tunnel_templates() {
  mkdir -p "${BROWSER_DEV_DIR}/cloudflare"
  cat > "${BROWSER_DEV_DIR}/cloudflare/code.teknovo.local.template.yml" << 'EOF'
# Cloudflare Tunnel placeholder — code-server
# Replace <TUNNEL_TOKEN> and route to localhost:8080
ingress:
  - hostname: code.teknovo.local
    service: http://127.0.0.1:8080
  - service: http_status:404
EOF
  cat > "${BROWSER_DEV_DIR}/cloudflare/ai.teknovo.local.template.yml" << 'EOF'
# Cloudflare Tunnel placeholder — Open WebUI
# Replace <TUNNEL_TOKEN> and route to localhost:3000
ingress:
  - hostname: ai.teknovo.local
    service: http://127.0.0.1:3000
  - service: http_status:404
EOF
  success "Cloudflare tunnel templates: ${BROWSER_DEV_DIR}/cloudflare/"
}

install_code_server() {
  if command_exists code-server; then
    success "code-server already installed: $(code-server --version 2>/dev/null | head -1)"
    return 0
  fi

  info "Installing code-server..."
  run_bash_script "https://code-server.dev/install.sh" --method detect
  command_exists code-server || die "code-server install failed"
  success "code-server installed: $(code-server --version 2>/dev/null | head -1)"
}

install_open_webui_docker() {
  if ! command_exists docker; then
    return 1
  fi
  if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q '^open-webui$'; then
    docker start open-webui 2>/dev/null || true
    success "Open WebUI container already exists — started"
    return 0
  fi
  info "Starting Open WebUI via Docker..."
  docker run -d --name open-webui \
    -p "${OPENWEBUI_PORT}:8080" \
    -v open-webui:/app/backend/data \
    -e OLLAMA_BASE_URL="${OLLAMA_HOST}" \
    --restart unless-stopped \
    ghcr.io/open-webui/open-webui:main
  success "Open WebUI Docker container started on port ${OPENWEBUI_PORT}"
}

install_open_webui_pip() {
  info "Docker unavailable — Open WebUI pip fallback not fully automated"
  warn "Install manually: pip install open-webui && open-webui serve --port ${OPENWEBUI_PORT}"
  cat > "${BROWSER_DEV_DIR}/open-webui-manual.sh" << EOF
#!/usr/bin/env bash
# Manual Open WebUI start (pip fallback)
export OLLAMA_BASE_URL="${OLLAMA_HOST}"
open-webui serve --port ${OPENWEBUI_PORT}
EOF
  chmod +x "${BROWSER_DEV_DIR}/open-webui-manual.sh"
  success "Manual script: ${BROWSER_DEV_DIR}/open-webui-manual.sh"
}

install_open_webui() {
  if install_open_webui_docker; then
    return 0
  fi
  install_open_webui_pip
}

write_browser_dev_readme() {
  cat > "${BROWSER_DEV_DIR}/README.md" << EOF
# Browser Development Mode (optional)

Installed by \`bootstrap/install-browser-dev.sh\`.

| Service | Local URL | Tunnel template |
|---------|-----------|-----------------|
| code-server | http://127.0.0.1:${CODE_SERVER_PORT} | cloudflare/code.teknovo.local.template.yml |
| Open WebUI | http://127.0.0.1:${OPENWEBUI_PORT} | cloudflare/ai.teknovo.local.template.yml |

Start code-server:

\`\`\`bash
code-server --bind-addr 127.0.0.1:${CODE_SERVER_PORT} ${REPO_ROOT}
\`\`\`

Ollama endpoint: ${OLLAMA_HOST}
EOF
  success "Browser dev README: ${BROWSER_DEV_DIR}/README.md"
}

main() {
  step "Browser Development Mode (optional)"
  require_linux
  mkdir -p "${BROWSER_DEV_DIR}"
  install_code_server
  install_open_webui
  write_tunnel_templates
  write_browser_dev_readme
  success "Browser Development Mode setup complete (optional — core install unaffected)"
  info "Enable tunnels via Cloudflare — templates in ${BROWSER_DEV_DIR}/cloudflare/"
}

main "$@"
