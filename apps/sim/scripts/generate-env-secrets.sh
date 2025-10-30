#!/bin/bash

# =================================================================
# Environment Security Keys Generator
# =================================================================
# This script generates cryptographically secure keys for your .env file
# Usage: ./scripts/generate-env-secrets.sh

set -e

echo "🔐 Generating secure environment keys..."
echo ""
echo "Copy these values to your .env file (NOT .env.example):"
echo "================================================================"
echo ""

echo "# Security Keys"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "INTERNAL_API_SECRET=$(openssl rand -hex 32)"
echo "SESSION_SECRET=$(openssl rand -hex 64)"
echo ""

echo "# Authentication"
echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)"
echo ""

echo "================================================================"
echo ""
echo "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "  1. NEVER commit your .env file to version control"
echo "  2. Use different keys for each environment (dev/staging/prod)"
echo "  3. Rotate these keys every 90 days in production"
echo "  4. Store production keys in a secure vault"
echo ""
echo "✅ Keys generated successfully!"
