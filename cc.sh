#!/bin/bash
set -euo pipefail
b(){ [ -f "$1" ] && cp -n "$1" "$1.bak" || true; }
r(){ b "$1"; perl -0777 -pe "$2" -i "$1"; }
add(){ [ -f "$1" ] && echo "File exists: $1" || printf "%s\n" "$2" > "$1"; }
commit(){ git add -A && git commit -m "CrisisCore: $*"; }
