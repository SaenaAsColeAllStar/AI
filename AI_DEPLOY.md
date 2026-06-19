# TEKNOVO AI WORKSTATION SETUP

## Target Stack

* Ubuntu 22.04
* RTX 3090 x2
* Ollama
* Qwen2.5-Coder 32B
* OpenCode
* Teknovo Monorepo
* AGENTS.md
* SKILL.md

---

# 1. Install Dependencies

```bash
apt update

apt install -y \
git \
curl \
wget \
nano \
tree \
zstd \
build-essential \
python3 \
python3-pip \
nodejs \
npm
```

Verify:

```bash
node -v
npm -v
python3 --version
```

---

# 2. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify:

```bash
ollama --version
```

---

# 3. Start Ollama

```bash
ollama serve
```

Expected:

```text
Listening on 127.0.0.1:11434
```

---

# 4. Download Qwen 32B

```bash
ollama pull qwen2.5-coder:32b
```

Verify:

```bash
curl http://127.0.0.1:11434/api/tags
```

Expected:

```json
{
  "models": [
    {
      "name": "qwen2.5-coder:32b"
    }
  ]
}
```

---

# 5. Test Model

```bash
curl http://127.0.0.1:11434/api/generate \
-d '{
  "model":"qwen2.5-coder:32b",
  "prompt":"Hello",
  "stream":false
}'
```

Expected:

```json
{
  "response":"Hello ..."
}
```

---

# 6. Install OpenCode

```bash
npm install -g opencode-ai
```

Verify:

```bash
opencode --version
```

Expected:

```text
1.17.x
```

---

# 7. Configure OpenCode

```bash
mkdir -p ~/.config/opencode

nano ~/.config/opencode/opencode.jsonc
```

Paste:

```json
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "ollama-local": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1"
      },
      "models": {
        "qwen2.5-coder:32b": {}
      }
    }
  },

  "model": "ollama-local/qwen2.5-coder:32b"
}
```

---

# 8. Setup GitHub SSH

Generate key:

```bash
ssh-keygen -t ed25519
```

Show public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Add to GitHub:

```text
GitHub
→ Settings
→ SSH Keys
→ New SSH Key
```

---

# 9. Clone Teknovo

```bash
cd /workspace

git clone git@github.com:SaenaAsColeAllStar/teknovo.git

cd teknovo
```

---

# 10. Verify Repository

```bash
tree -L 2
```

Expected:

```text
.agents
apps
docs
packages
```

Verify skills:

```bash
tree .agents -L 3
```

Expected:

```text
AGENTS.md

skills/
├── teknovo-ui-ux
├── teknovo-backend-development
├── teknovo-domain-management
└── teknovo-landing-page
```

---

# 11. Root AGENTS.md

Create:

```bash
nano AGENTS.md
```

Paste:

```md
# Teknovo AI Startup Rules

Before answering:

1. Read .agents/AGENTS.md

2. Read:
   .agents/skills/**/SKILL.md

3. Read:
   docs/prd/**
   docs/architecture/**
   docs/database/**
   docs/adr/**

Priority:

ADR
PRD
Database
API
RBAC
UI
```

---

# 12. Create Registry

```bash
nano .agents/registry.yaml
```

Paste:

```yaml
skills:

  ui:
    path: .agents/skills/teknovo-ui-ux/SKILL.md

  backend:
    path: .agents/skills/teknovo-backend-development/SKILL.md

  domain:
    path: .agents/skills/teknovo-domain-management/SKILL.md

  landing:
    path: .agents/skills/teknovo-landing-page/SKILL.md
```

---

# 13. Start OpenCode

```bash
cd /workspace/teknovo

opencode
```

Test prompt:

```text
Read .agents/AGENTS.md and summarize architecture rules.
```

Expected:

```text
Build · qwen2.5-coder:32b
```

---

# 14. Commit Everything

```bash
git add .

git commit -m "feat: teknovo ai workstation"

git push
```

---

# Recovery After GPU Expires

Restore everything:

```bash
git clone git@github.com:SaenaAsColeAllStar/teknovo.git

curl -fsSL https://ollama.com/install.sh | sh

ollama serve

ollama pull qwen2.5-coder:32b

npm install -g opencode-ai

cd teknovo

opencode
```

Total restore time:

```text
10-15 minutes
```

No need to rebuild AGENTS, skills, docs, or architecture because everything lives inside GitHub.
