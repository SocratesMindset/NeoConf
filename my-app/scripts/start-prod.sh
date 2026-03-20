#!/bin/bash
set -euo pipefail

./node_modules/.bin/prisma db push
node prisma/seed.mjs
./node_modules/.bin/next start -p "${PORT:-3000}"
