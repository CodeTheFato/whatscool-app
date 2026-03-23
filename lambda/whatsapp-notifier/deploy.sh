#!/usr/bin/env bash
set -euo pipefail

# ==================== CONFIG ====================
FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-whatscool-whatsapp-dispatcher}"
REGION="${AWS_REGION:-us-east-1}"
ZIP_FILE="function.zip"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ==================== BUILD ====================
echo "📦 Zipping lambda code..."
rm -f "$ZIP_FILE"
zip -j "$ZIP_FILE" index.mjs whatsappNotification.mjs

echo "📤 Deploying to Lambda: $FUNCTION_NAME ($REGION)..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb://$ZIP_FILE" \
  --region "$REGION" \
  --no-cli-pager

echo "✅ Deploy complete!"

# Cleanup
rm -f "$ZIP_FILE"
