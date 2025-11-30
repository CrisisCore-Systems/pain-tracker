#!/bin/bash
# CrisisCore-Auditor++ Full Hardening and Verification Script
set -euo pipefail
set +H

# --- Bootstrap helper functions ---
cat > cc.sh <<'SH'
set -euo pipefail
# Backup file if it exists: b(file)
b(){ [ -f "$1" ] && cp -n "$1" "$1.bak" || true; }
# Replace in file: r(file, perl_regex)
r(){ b "$1"; perl -0777 -pi -e "$2" "$1"; }
# Insert after pattern: ia(file, pattern, insertion)
ia(){ b "$1"; awk -v a="$2" -v b="$3" 'BEGIN{RS="";ORS=""}{if($0~a){sub(a,sprintf("%s\n%s",a,b))}print}' "$1">"$1.tmp" && mv "$1.tmp" "$1"; }
# Add file if not exists: add(file, content)
add(){ [ -f "$1" ] && echo "skip: $1 already exists" || printf "%s\n" "$2" > "$1"; }
# Git commit helper: commit(message)
commit(){ git add -A && git commit -m "CrisisCore: $*"; }
SH
chmod +x cc.sh; . ./cc.sh
echo "✅ Helper functions bootstrapped."

# --- [CRITICAL] Secure Environment Boundary ---
echo
echo "--- Applying [CRITICAL] Environment Configuration Boundary Violation fix ---"
r .env.example 's/# WCB_API_KEY=your_wcb_api_key_here/# WCB_API_KEY secured in backend only/'
r .env.example 's/NODE_ENV=development WCB_API_ENDPOINT=https:\/\/api\.wcb\.gov\/submissions/NODE_ENV=development/'
ENV_CLEAN='# Frontend vars only (VITE_ prefix exposes to client)
VITE_WCB_API_ENDPOINT=/api/wcb
VITE_APP_ENVIRONMENT=development
VITE_SENTRY_DSN=

# Backend secrets (never VITE_ prefixed)
WCB_API_KEY=backend_only_secret
'
add .env.clean "$ENV_CLEAN"
mv .env.clean .env.example
commit "fix(env): secure environment configuration boundary"
echo "✅ Environment configuration hardened."

# --- [HIGH] Restore Workflow Secrets ---
echo
echo "--- Applying [HIGH] Workflow Secret Management Degradation fix ---"
r .github/workflows/pages.yml 's/VITE_WCB_API_ENDPOINT: \/api\/wcb/VITE_WCB_API_ENDPOINT: \${{ secrets.WCB_API_ENDPOINT || '\''\/api\/wcb'\'' }}/'
rm -f .github/workflows/pages.yml.bak
commit "fix(ci): restore workflow secrets with fallback"
echo "✅ Workflow secret management restored."

# --- [MODERATE] Harden TypeScript Barriers ---
echo
echo "--- Applying [MODERATE] TypeScript Collapse Vector Enablement fix ---"
r .eslintrc.json 's/"@typescript-eslint\/no-explicit-any": "warn"/"@typescript-eslint\/no-explicit-any": "error"/'
r .eslintrc.json 's/"@typescript-eslint\/no-unused-vars": "warn"/"@typescript-eslint\/no-unused-vars": "error"/'
TS_RULES='    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error"'
ia .eslintrc.json '"@typescript-eslint/no-unused-vars": "error"' "$TS_RULES"
commit "style(lint): harden typescript collapse prevention rules"
echo "✅ TypeScript rules hardened."

# --- [LOW] Stabilize Diff Consistency ---
echo
echo "--- Applying [LOW] Diff Pollution Attack Surface fix ---"
r .prettierrc 's/"endOfLine": "auto"/"endOfLine": "lf"/'
commit "style(format): stabilize line endings for clean diffs"
echo "✅ Prettier line endings stabilized."

# --- Post-Remediation System Health Check ---
echo
echo "--- Running Post-Remediation System Health Check ---"
# Explicitly use 'node' for reliability
if node ./scripts/check-collapse-vectors.js; then
    echo "✅ Vector scan clean."
else
    echo "❌ CRITICAL: Collapse vectors were detected!"
    exit 1
fi

# If grep finds "error", it exits 0 (success), triggering the '&&' branch.
if npm run lint 2>&1 | grep -E "(error|Error)"; then
    echo "❌ Lint errors found. Please review output."
    exit 1
else
    echo "✅ Lint clean."
fi

if git status --porcelain | grep .; then
    echo "❌ Uncommitted changes detected in working tree."
    exit 1
else
    echo "✅ Clean working tree."
fi

echo
echo "🎉 CrisisCore-Auditor++ reassessment complete. System hardened."
