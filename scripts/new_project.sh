#!/bin/bash
# Usage: new_project.sh <project_dir>
# Scaffolds a cinematic-video project: engine files, node deps, python venv.
set -e
SK="$(cd "$(dirname "$0")/.." && pwd)"; P="$1"
[ -z "$P" ] && { echo "usage: new_project.sh <project_dir>"; exit 1; }
mkdir -p "$P/src/scenes" "$P/img" "$P/prev"
cp -n "$SK/assets/engine/index.html" "$SK/assets/engine/package.json" "$SK/assets/engine/render.js" "$P/" 2>/dev/null || true
cp "$SK/assets/engine/src/core.js" "$SK/assets/engine/src/main.js" "$P/src/"
cp -n "$SK/assets/engine/src/scenes/stub.js" "$P/src/scenes/" 2>/dev/null || true
[ -f "$P/img/manifest.js" ] || echo "window.IMAGES=[];" > "$P/img/manifest.js"
cd "$P"
[ -d node_modules/three ] || npm install --silent
[ -x .venv/bin/python ] || { python3 -m venv .venv && .venv/bin/pip install -q numpy azure-cognitiveservices-speech; }
echo "project ready: $P"
