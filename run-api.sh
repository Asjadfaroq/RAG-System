#!/usr/bin/env bash
# Run the API: build once (with progress), then start with --no-build for fast startup.
# First run: ~10–20s build then server starts. Later runs: server starts in ~1s.
set -e
cd "$(dirname "$0")"
if [ -n "$DOTNET_ENV_LOADED" ]; then
  set -a && [ -f .env ] && source .env && set +a
fi
cd DocumentIntelligence.Api
echo "Building (first time may take 10–20s)..."
dotnet build
echo ""
echo "Starting API..."
exec dotnet run --no-build
