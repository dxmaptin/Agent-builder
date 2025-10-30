# Security & Environment Configuration Guide

## Quick Start: Generating Secure Keys

### Using the Script (Recommended)

```bash
./scripts/generate-env-secrets.sh
```

This will generate all necessary security keys. Copy the output to your `.env` file.

### Manual Generation

Generate individual keys using OpenSSL:

```bash
# Encryption key (32 bytes = 64 hex characters)
openssl rand -hex 32

# Internal API secret (32 bytes = 64 hex characters)
openssl rand -hex 32

# Session secret (64 bytes = 128 hex characters) - extra strong
openssl rand -hex 64

# Better Auth secret (32 bytes = 64 hex characters)
openssl rand -hex 32
```

## Core Security Variables

### Required for All Environments

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication
BETTER_AUTH_SECRET=<generate-with-openssl>
BETTER_AUTH_URL=http://localhost:3000  # Change to production URL in prod

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL in prod

# Security Keys
ENCRYPTION_KEY=<generate-with-openssl>        # Encrypts sensitive data in database
INTERNAL_API_SECRET=<generate-with-openssl>   # Secures internal API routes

# LLM Provider (at least ONE required)
OPENAI_API_KEY=<your-api-key>                 # Get from https://platform.openai.com/api-keys
# OR
ANTHROPIC_API_KEY_1=<your-api-key>            # Get from https://console.anthropic.com/
# OR
OLLAMA_URL=http://localhost:11434             # Free local option - install from https://ollama.com
```

## LLM Provider Configuration

**Your application REQUIRES at least ONE LLM provider to function.** The application uses these models to power AI agents, workflow automation, and the copilot feature.

### Option 1: OpenAI (Recommended for Beginners)

**Best for:** Most users, great documentation, reliable API

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

- [Get API key from OpenAI Platform](https://platform.openai.com/api-keys)
- **Cost:** Pay-as-you-go (~$0.01-$0.06 per 1K tokens depending on model)
- **Models available:** GPT-4o, GPT-4, GPT-3.5, embeddings, etc.
- **Load balancing:** Add multiple keys for high traffic:
  ```bash
  OPENAI_API_KEY_1=sk-proj-key1
  OPENAI_API_KEY_2=sk-proj-key2
  OPENAI_API_KEY_3=sk-proj-key3
  ```

### Option 2: Anthropic Claude

**Best for:** Complex reasoning, high-quality outputs, safety-focused

```bash
ANTHROPIC_API_KEY_1=sk-ant-xxxxxxxxxxxx
```

- [Get API key from Anthropic Console](https://console.anthropic.com/)
- **Cost:** Pay-as-you-go (~$0.003-$0.015 per 1K tokens)
- **Models available:** Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Load balancing supported:**
  ```bash
  ANTHROPIC_API_KEY_1=sk-ant-key1
  ANTHROPIC_API_KEY_2=sk-ant-key2
  ANTHROPIC_API_KEY_3=sk-ant-key3
  ```

### Option 3: Ollama (Free, Local)

**Best for:** Development, privacy-focused, no API costs

```bash
OLLAMA_URL=http://localhost:11434
```

- [Download and install Ollama](https://ollama.com)
- **Cost:** Free! Runs on your local machine
- **Models available:** Llama 2, Mistral, CodeLlama, and many more
- **Setup:**
  ```bash
  # Install Ollama
  curl -fsSL https://ollama.com/install.sh | sh

  # Pull a model
  ollama pull llama2

  # Start the server (usually auto-starts)
  ollama serve
  ```

### Option 4: Mistral AI

**Best for:** European data compliance, cost-effective

```bash
MISTRAL_API_KEY=xxxxxxxxxxxx
```

- [Get API key from Mistral Console](https://console.mistral.ai/)
- **Cost:** Very competitive pricing
- **Models available:** Mistral Large, Mistral Medium, Mistral Small

### Option 5: Azure OpenAI (Enterprise)

**Best for:** Enterprise compliance, private deployment, SLA requirements

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
KB_OPENAI_MODEL_NAME=text-embedding-ada-002
```

- [Setup Azure OpenAI in Azure Portal](https://portal.azure.com)
- **Cost:** Based on Azure pricing model
- **Benefits:** Private deployment, compliance certifications, dedicated capacity

### Configuring the Copilot Feature

The copilot helps you build workflows with AI assistance. Configure which model it uses:

```bash
COPILOT_PROVIDER=openai              # Options: openai, anthropic, ollama
COPILOT_MODEL=gpt-4o                 # Choose model based on provider
COPILOT_API_KEY=                     # Optional: if different from main key
```

### Additional AI Services

```bash
# Text-to-speech for chat interfaces
ELEVENLABS_API_KEY=your_elevenlabs_key

# Web search capabilities for agents
SERPER_API_KEY=your_serper_key       # Google Search API
EXA_API_KEY=your_exa_key             # AI-powered semantic search
```

## Enhanced Authentication Setup

### OAuth Providers (Optional)

Enable social login by configuring OAuth providers:

#### Google OAuth
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id  # For client-side
```

[Get credentials from Google Cloud Console](https://console.cloud.google.com/apis/credentials)

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

[Get credentials from GitHub Developer Settings](https://github.com/settings/developers)

#### Microsoft OAuth (Office 365)
```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

[Get credentials from Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

#### Discord OAuth
```bash
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

[Get credentials from Discord Developer Portal](https://discord.com/developers/applications)

### SSO Configuration (Enterprise)

For OIDC-based SSO:

```bash
SSO_ENABLED=true
SSO_PROVIDER_TYPE=oidc
SSO_PROVIDER_ID=your_sso_provider
SSO_ISSUER=https://your-identity-provider.com
SSO_DOMAIN=yourcompany.com
SSO_OIDC_CLIENT_ID=your_oidc_client_id
SSO_OIDC_CLIENT_SECRET=your_oidc_client_secret
```

For SAML-based SSO:

```bash
SSO_ENABLED=true
SSO_PROVIDER_TYPE=saml
SSO_PROVIDER_ID=your_sso_provider
SSO_ISSUER=https://your-identity-provider.com
SSO_DOMAIN=yourcompany.com
SSO_SAML_ENTRY_POINT=https://idp.example.com/sso
SSO_SAML_CERT="-----BEGIN CERTIFICATE-----..."
```

### Email Verification

```bash
EMAIL_VERIFICATION_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL_ADDRESS="Your App <noreply@yourdomain.com>"
```

## Security Best Practices

### 1. Key Management

**DO:**
- ✅ Generate unique keys for each environment (dev, staging, prod)
- ✅ Use cryptographically secure random values (`openssl rand -hex 32`)
- ✅ Store production keys in a secure vault (AWS Secrets Manager, HashiCorp Vault)
- ✅ Rotate keys every 90 days in production
- ✅ Use at least 64 characters (32 bytes hex) for encryption keys

**DON'T:**
- ❌ Commit `.env` files to version control
- ❌ Reuse keys across environments
- ❌ Use short or predictable keys
- ❌ Share production keys via email or chat
- ❌ Keep default placeholder values

### 2. Key Rotation Strategy

When rotating keys:

1. **Dual-key period**: Add new key as `ENCRYPTION_KEY_NEW`
2. **Decrypt with old, encrypt with new**: Update application logic
3. **Background migration**: Re-encrypt existing data
4. **Switch to new key**: Remove old key after migration
5. **Document rotation**: Keep audit log of key changes

### 3. Environment Separation

```
Development  → Use script-generated keys, localhost URLs
Staging      → Production-like keys, staging URLs
Production   → Vault-stored keys, production URLs, strict validation
```

### 4. Validation

Run security validation during application startup:

```typescript
import { logSecurityValidation, securityHealthCheck } from '@/lib/security/env-validator'

// In your startup code (e.g., instrumentation.ts)
logSecurityValidation()

// For health checks
const health = securityHealthCheck()
console.log(health)
```

## Production Checklist

Before deploying to production:

- [ ] All security keys are generated with `openssl rand -hex`
- [ ] Keys are at least 64 characters (32 bytes)
- [ ] Keys are stored in secure vault, not in plain text
- [ ] Different keys used for prod vs dev/staging
- [ ] No localhost URLs in `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL`
- [ ] `.env` file is in `.gitignore`
- [ ] OAuth redirect URIs are configured for production domains
- [ ] SSL/TLS certificates are valid
- [ ] Rate limiting is configured (`RATE_LIMIT_*` variables)
- [ ] Email verification is enabled (`EMAIL_VERIFICATION_ENABLED=true`)
- [ ] Backup encryption keys are securely stored offline

## Using the Security Utilities

### Validate Configuration

```typescript
import { validateSecurityConfig } from '@/lib/security/env-validator'

const result = validateSecurityConfig()

if (!result.valid) {
  console.error('Security issues:', result.errors)
}
```

### Check OAuth Providers

```typescript
import { isOAuthConfigured, getConfiguredOAuthProviders } from '@/lib/security/env-validator'

if (isOAuthConfigured('google')) {
  console.log('Google OAuth is ready')
}

const providers = getConfiguredOAuthProviders()
console.log('Available OAuth providers:', providers)
```

### Health Check Endpoint

```typescript
// app/api/health/security/route.ts
import { securityHealthCheck } from '@/lib/security/env-validator'
import { NextResponse } from 'next/server'

export async function GET() {
  const health = securityHealthCheck()

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 500
  })
}
```

## Troubleshooting

### "ENCRYPTION_KEY must be changed from default value"
- Generate a new key: `openssl rand -hex 32`
- Update your `.env` file with the new value

### "Security validation failed in production"
- Check all error messages in console
- Ensure no localhost URLs
- Verify key lengths (minimum 64 characters)

### OAuth redirect URI mismatch
- Ensure OAuth provider callback URL matches: `{BETTER_AUTH_URL}/api/auth/callback/{provider}`
- Example: `https://app.yourdomain.com/api/auth/callback/google`

## Additional Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Key Rotation Schedule

Set reminders to rotate keys:

- **Every 90 days**: Production encryption and API keys
- **Every 180 days**: OAuth client secrets
- **Immediately**: After suspected compromise
- **After departures**: When team members with key access leave

## Emergency Key Rotation

If a key is compromised:

1. Generate new key immediately
2. Deploy new key to production
3. Invalidate all existing sessions/tokens
4. Force user re-authentication
5. Audit access logs
6. Document incident
