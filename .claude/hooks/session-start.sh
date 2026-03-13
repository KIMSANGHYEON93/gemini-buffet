#!/bin/bash
set -euo pipefail

# Only run in remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 1. Node.js dependencies (Next.js app)
npm install --legacy-peer-deps

# 2. Python: github-mcp-server dependencies
pip install "fastmcp>=3.1.0" "httpx>=0.28.1" "python-dotenv>=1.2.2"

# 3. Python: web-search-agent
pip install -r ./web-search-agent/requirements.txt
