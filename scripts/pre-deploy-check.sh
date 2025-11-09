#!/bin/bash

# Pre-deployment Mobile-First Guardian Check
# Run this script before deploying to production

echo "🛡️  Running Mobile-First Guardian pre-deployment check..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run the Guardian CI scan
node scripts/mobile-guardian-ci.mjs

# Capture exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Mobile-First compliance check PASSED"
  echo "🚀 Deployment can proceed"
  exit 0
else
  echo ""
  echo "❌ Mobile-First compliance check FAILED"
  echo "🚫 Deployment BLOCKED"
  echo ""
  echo "To fix:"
  echo "  1. Review violations in the report above"
  echo "  2. Apply recommended fixes"
  echo "  3. Run 'npm run mobile-guardian-ci' locally to verify"
  echo "  4. Commit and push fixes"
  echo ""
  exit 1
fi
