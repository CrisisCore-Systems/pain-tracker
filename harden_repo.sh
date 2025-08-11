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

# --- [CRITICAL] Implement Collapse Vector Detection Script ---
echo
echo "--- Applying [CRITICAL] Collapse Vector Detection fix ---"
CHECK_SCRIPT='#!/usr/bin/env node
const fs=require("fs");const path=require("path");
const vectors=[
  {n:"PriceFeedback",p:/price.*=.*Math\.random|Math\.random.*price/},
  {n:"EpochDrift",p:/timestamp.*=.*Date\.now\(\).*(?!epoch)/},
  {n:"CartQuantum",p:/cart.*=.*\[.*Math\.random|Math\.random.*\].*cart/},
  {n:"LoopPublish",p:/publish.*\(.*(?:this|self).*\)/},
  {n:"MemoryBleed",p:/window\[.*\].*=.*(?!null)/},
  {n:"AsyncWrite",p:/async.*=.*(?!await)/}
];
const scan=d=>{if(!fs.existsSync(d))return[];return fs.readdirSync(d).flatMap(f=>{const p=path.join(d,f);return fs.statSync(p).isDirectory()?scan(p):f.match(/\.(ts|js|tsx|jsx)$/)?[p]:[]})};
const files=scan("src");
let found=0;
files.forEach(f=>{const c=fs.readFileSync(f,"utf8");vectors.forEach(v=>{if(v.p.test(c)){console.error(`COLLAPSE VECTOR ${v.n} in ${f}`);found++}})});
if(found){console.error(`CRISIS: ${found} collapse vectors detected`);process.exit(1)}
console.log("✅ No collapse vectors detected");process.exit(0);'
add scripts/check-collapse-vectors.js "$CHECK_SCRIPT"
chmod +x scripts/check-collapse-vectors.js
commit "feat(security): implement collapse vector detection system"
echo "✅ Collapse vector detection script implemented."

# --- [HIGH] Secure Environment Configuration ---
echo
echo "--- Applying [HIGH] Environment Configuration Drift Vector fix ---"
r .env.example 's/# WCB_API_KEY=your_wcb_api_key_here/# WCB_API_KEY secured in backend - never expose frontend/'
r .env.example 's/WCB_API_ENDPOINT=https:\/\/api\.wcb\.gov\/submissions/# Removed duplicate - use VITE_WCB_API_ENDPOINT only/'
r .env.example 's/NODE_ENV=development WCB_API_ENDPOINT=https:\/\/api\.wcb\.gov\/submissions/NODE_ENV=development/'
ENV_VARS='
# Security boundary: only VITE_ vars exposed to frontend
VITE_WCB_API_ENDPOINT=/api/wcb
VITE_APP_ENVIRONMENT=development
VITE_SENTRY_DSN=

# Backend only vars (not prefixed with VITE_)
WCB_API_KEY=backend_secret_only
'
add .env.example "$ENV_VARS"
commit "fix(env): establish secure frontend/backend environment boundary"
echo "✅ Environment configuration hardened."

# --- [HIGH] Restore Workflow Secret Management ---
echo
echo "--- Applying [HIGH] Workflow Secret Consistency Collapse fix ---"
r .github/workflows/pages.yml 's/VITE_WCB_API_ENDPOINT: \/api\/wcb/VITE_WCB_API_ENDPOINT: \${{ secrets.WCB_API_ENDPOINT || '\''\/api\/wcb'\'' }}/'
SECURITY_MD='# Security Policy

## Environment Variables
- All secrets must use GitHub Secrets
- No hardcoded endpoints in workflows
- Frontend vars must be VITE_ prefixed

## Required Secrets
- WCB_API_ENDPOINT: WCB API endpoint URL
- SENTRY_DSN: Error tracking endpoint
'
add .github/SECURITY.md "$SECURITY_MD"
rm -f .github/workflows/pages.yml.bak
commit "fix(ci): restore workflow secrets with fallback and add policy"
echo "✅ Workflow secret management restored."

# --- [MODERATE] Harden TypeScript Rules ---
echo
echo "--- Applying [MODERATE] TypeScript Safety Degradation fix ---"
r .eslintrc.json 's/"@typescript-eslint\/no-explicit-any": "warn"/"@typescript-eslint\/no-explicit-any": "error"/'
r .eslintrc.json 's/"@typescript-eslint\/no-unused-vars": "warn"/"@typescript-eslint\/no-unused-vars": "error"/'
TS_RULES='    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error"'
ia .eslintrc.json '"@typescript-eslint/no-unused-vars": "error"' "$TS_RULES"
commit "style(lint): harden typescript rules against collapse vectors"
echo "✅ TypeScript rules hardened."

# --- [MODERATE] Stabilize Diff Consistency ---
echo
echo "--- Applying [MODERATE] Diff Pollution Attack Vector fix ---"
r .prettierrc 's/"endOfLine": "auto"/"endOfLine": "lf"/'
commit "style(format): set consistent line endings to prevent diff pollution"
echo "✅ Prettier configuration stabilized."

# --- System Health Verification ---
echo
echo "--- Running System Health Verification ---"
# Explicitly use node to run the scanner for reliability
if node ./scripts/check-collapse-vectors.js; then
    echo "✅ Vector scan clean."
else
    echo "❌ CRITICAL: Collapse vectors detected!"
    exit 1
fi

# If grep finds "error", it exits 0 (success), triggering the '&&' branch.
if npm run lint 2>&1 | grep -E "(error|Error)"; then
    echo "❌ Lint errors found. Please review."
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
echo "🎉 CrisisCore-Auditor++ assessment complete. System hardened against collapse vectors."
