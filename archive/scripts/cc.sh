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
