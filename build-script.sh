#!/bin/sh

set -euo pipefail

cd script 
bun i
bun run build
cd ..
cp script/dist/main.js public/script.js

echo "Generated script"
