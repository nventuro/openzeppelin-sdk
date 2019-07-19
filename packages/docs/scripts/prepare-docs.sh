#!/usr/bin/env bash

log() {
  echo "$*" >&2
}

# lib
log "Building lib docs..."
solidity-docgen -i ../lib/contracts/ -o modules/lib/pages -e ../lib/contracts/mocks -x adoc -t templates
log "Done"

# cli
log "Building CLI docs..."

# [TODO] run this only if dependencies aren't installed yet
cd ../..
shopt -s globstar && rm -rf **/node_modules/websocket/.git
npm ci
npx lerna bootstrap
cd packages/cli

npm run gen-docs
log "Done"