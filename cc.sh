set -euo pipefail
b(){ [ -f "$1" ]&&cp -n "$1" "$1.bak"||true; }
r(){ b "$1"; perl -0777 -pe "$2" -i "$1"; }
ia(){ b "$1"; awk -v a="$2" -v b="$3" 'BEGIN{RS="";ORS=""}{if($0~a){sub(a,sprintf("%s\n%s",a,b))}print}' "$1">"$1.tmp"&&mv "$1.tmp" "$1"; }
add(){ [ -f "$1" ]&&echo "skip: $1 already exists"||printf "%s\n" "$2" > "$1"; }
commit(){ git add -A && git commit -m "CrisisCore: $*"; }
