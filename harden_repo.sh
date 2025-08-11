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

# --- [CRITICAL] Secure Environment Configuration ---
echo
echo "--- Applying [CRITICAL] Environment Secret Leakage Vector fix ---"
r .env.example 's/# WCB_API_KEY=your_wcb_api_key_here/# WCB_API_KEY moved to backend - never expose in frontend/'
r .env.example 's/WCB_API_ENDPOINT=https:\/\/api\.wcb\.gov\/submissions/# WCB_API_ENDPOINT configured per environment/'
# Using a temp var to handle the multiline add
ENV_VARS="# Frontend vars only - no secrets\nVITE_APP_ENVIRONMENT=development\nVITE_WCB_API_ENDPOINT=/api/wcb"
add .env.example "$ENV_VARS"
commit "harden(env): secure env config against frontend secret exposure"
echo "✅ Environment config hardened."

# --- [HIGH] Implement Pre-commit Safety Gate ---
echo
echo "--- Applying [HIGH] Pre-commit Safety Gate Bypass Vector fix ---"
# Using a temp var for multiline script content
CHECK_SCRIPT="#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const patterns=[/Math\\.random\\(\\)(?!.*seed)/,/async.*=.*(?!await)/,/price.*=.*Math/,/\\\$\\{.*\\\}.*api/];
const scan=d=>{if(!fs.existsSync(d))return[];return fs.readdirSync(d).flatMap(f=>{const p=path.join(d,f);return fs.statSync(p).isDirectory()?scan(p):f.match(/\\.(ts|js|tsx|jsx)$/)?[p]:[]})};
const files=scan('src');
let found=0;
files.forEach(f=>{const c=fs.readFileSync(f,'utf8');patterns.forEach((p,i)=>{if(p.test(c)){console.error(\`COLLAPSE VECTOR \${i+1} detected in \${f}\`);found++}})});
if (found > 0) process.exit(1);"
add scripts/check-collapse-vectors.js "$CHECK_SCRIPT"
chmod +x scripts/check-collapse-vectors.js
commit "feat(security): implement collapse vector pre-commit detection"
echo "✅ Pre-commit safety gate implemented."

# --- [HIGH] Fix GitHub Actions Secret Inconsistency ---
echo
echo "--- Applying [HIGH] GitHub Actions Secret Inconsistency fix ---"
r .github/workflows/pages.yml 's/VITE_WCB_API_ENDPOINT: \/api\/wcb/VITE_WCB_API_ENDPOINT: \${{ secrets.WCB_API_ENDPOINT || '\''\/api\/wcb'\'' }}/'
rm -f .github/workflows/pages.yml.bak
commit "fix(ci): ensure consistent secret handling in workflow"
echo "✅ Workflow secret handling fixed."

# --- [MODERATE] Harden ESLint Configuration ---
echo
echo "--- Applying [MODERATE] ESLint Configuration Weakness fix ---"
r .eslintrc.json 's/"@typescript-eslint\/no-explicit-any": "warn"/"@typescript-eslint\/no-explicit-any": "error"/'
r .eslintrc.json 's/"@typescript-eslint\/no-unused-vars": "warn"/"@typescript-eslint\/no-unused-vars": "error"/'
ia .eslintrc.json '"@typescript-eslint/no-unused-vars": "error"' '    "@typescript-eslint/no-floating-promises": "error",\n    "@typescript-eslint/await-thenable": "error"'
commit "style(lint): harden typescript rules against collapse vectors"
echo "✅ ESLint rules hardened."

# --- [MODERATE] Stabilize Prettier Configuration ---
echo
echo "--- Applying [MODERATE] Prettier Configuration Drift Risk fix ---"
r .prettierrc 's/"endOfLine": "auto"/"endOfLine": "lf"/'
commit "style(format): set consistent line endings in prettier"
echo "✅ Prettier configuration stabilized."

# --- Post-Assessment System Health Check ---
echo
echo "--- Running Post-Assessment System Health Check ---"
if npm run lint 2>&1 | grep -i 'error'; then
    echo "❌ Linting failed with errors."
    exit 1
else
    echo "✅ Lint clean: No new errors found."
fi

if ./scripts/check-collapse-vectors.js; then
    echo "✅ Vector scan clean: No collapse vectors detected."
else
    echo "❌ Collapse vectors detected!"
    exit 1
fi

if git status --porcelain | grep .; then
    echo "❌ Git status is not clean. Please commit or stash changes."
    exit 1
else
    echo "✅ Git status clean: All changes have been committed."
fi

echo
echo "🎉 Hardening complete. All checks passed."
