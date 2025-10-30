/**
 * Security-focused environment validation utilities
 *
 * Provides runtime checks for security best practices and key management
 */

import { env } from '../env'

export interface SecurityValidationResult {
  valid: boolean
  warnings: string[]
  errors: string[]
  recommendations: string[]
}

/**
 * Validates security configuration and provides recommendations
 */
export function validateSecurityConfig(): SecurityValidationResult {
  const result: SecurityValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
    recommendations: [],
  }

  const isProduction = env.NODE_ENV === 'production'

  // Check encryption key strength
  if (env.ENCRYPTION_KEY.length < 64) {
    const message = `ENCRYPTION_KEY is ${env.ENCRYPTION_KEY.length} characters. Recommended: 64+ characters (32 bytes hex)`
    if (isProduction) {
      result.errors.push(message)
      result.valid = false
    } else {
      result.warnings.push(message)
    }
  }

  // Check internal API secret strength
  if (env.INTERNAL_API_SECRET.length < 64) {
    const message = `INTERNAL_API_SECRET is ${env.INTERNAL_API_SECRET.length} characters. Recommended: 64+ characters (32 bytes hex)`
    if (isProduction) {
      result.errors.push(message)
      result.valid = false
    } else {
      result.warnings.push(message)
    }
  }

  // Check Better Auth secret
  if (env.BETTER_AUTH_SECRET.length < 64) {
    result.warnings.push(
      `BETTER_AUTH_SECRET is ${env.BETTER_AUTH_SECRET.length} characters. Recommended: 64+ characters for better security`
    )
  }

  // Check for localhost URLs in production
  if (isProduction) {
    if (env.BETTER_AUTH_URL.includes('localhost')) {
      result.errors.push('BETTER_AUTH_URL uses localhost in production')
      result.valid = false
    }
    if (env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
      result.errors.push('NEXT_PUBLIC_APP_URL uses localhost in production')
      result.valid = false
    }
  }

  // Check for default/placeholder values
  const defaultPatterns = [
    'your_',
    'change_me',
    'replace_me',
    'example',
    'test123',
    'password',
  ]

  const checkForDefaults = (key: string, value: string) => {
    const lowerValue = value.toLowerCase()
    for (const pattern of defaultPatterns) {
      if (lowerValue.includes(pattern)) {
        result.errors.push(`${key} appears to contain a default/placeholder value`)
        result.valid = false
        break
      }
    }
  }

  checkForDefaults('ENCRYPTION_KEY', env.ENCRYPTION_KEY)
  checkForDefaults('INTERNAL_API_SECRET', env.INTERNAL_API_SECRET)
  checkForDefaults('BETTER_AUTH_SECRET', env.BETTER_AUTH_SECRET)

  // Check entropy (simple heuristic: should look like random hex)
  const checkEntropy = (key: string, value: string) => {
    if (value.length < 32) return

    // Check if it's hex (should be for crypto keys)
    const isHex = /^[0-9a-f]+$/i.test(value)
    if (!isHex && value.length === 64) {
      result.warnings.push(
        `${key} doesn't appear to be hex-encoded. Use 'openssl rand -hex 32' to generate proper keys`
      )
    }

    // Check for repeated patterns
    const hasRepeatedChars = /(.)\1{5,}/.test(value)
    if (hasRepeatedChars) {
      result.warnings.push(`${key} contains repeated character sequences (low entropy)`)
    }
  }

  checkEntropy('ENCRYPTION_KEY', env.ENCRYPTION_KEY)
  checkEntropy('INTERNAL_API_SECRET', env.INTERNAL_API_SECRET)
  checkEntropy('BETTER_AUTH_SECRET', env.BETTER_AUTH_SECRET)

  // Recommendations
  result.recommendations.push('Rotate security keys every 90 days in production')
  result.recommendations.push('Store production keys in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)')
  result.recommendations.push('Use different keys for each environment (dev/staging/prod)')
  result.recommendations.push('Never commit .env files to version control')

  if (isProduction && !env.REDIS_URL) {
    result.recommendations.push('Consider using Redis for session storage in production for better scalability')
  }

  return result
}

/**
 * Logs security validation results
 */
export function logSecurityValidation() {
  const result = validateSecurityConfig()

  if (result.errors.length > 0) {
    console.error('\n🔴 SECURITY ERRORS:')
    result.errors.forEach((error) => console.error(`  ❌ ${error}`))
  }

  if (result.warnings.length > 0) {
    console.warn('\n🟡 SECURITY WARNINGS:')
    result.warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`))
  }

  if (result.recommendations.length > 0 && env.NODE_ENV === 'development') {
    console.info('\n💡 SECURITY RECOMMENDATIONS:')
    result.recommendations.forEach((rec) => console.info(`  ℹ️  ${rec}`))
  }

  if (result.valid) {
    console.log('\n✅ Security configuration validation passed')
  } else {
    console.error('\n❌ Security configuration validation failed')
    if (env.NODE_ENV === 'production') {
      throw new Error('Security validation failed in production. Please fix the errors above.')
    }
  }

  return result
}

/**
 * Checks if OAuth provider is properly configured
 */
export function isOAuthConfigured(provider: 'google' | 'github' | 'microsoft' | 'discord'): boolean {
  const configs = {
    google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    microsoft: !!(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET),
    discord: !!(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET),
  }
  return configs[provider] || false
}

/**
 * Gets list of all configured OAuth providers
 */
export function getConfiguredOAuthProviders(): string[] {
  const providers: string[] = []

  if (isOAuthConfigured('google')) providers.push('google')
  if (isOAuthConfigured('github')) providers.push('github')
  if (isOAuthConfigured('microsoft')) providers.push('microsoft')
  if (isOAuthConfigured('discord')) providers.push('discord')

  return providers
}

/**
 * Checks if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(env.RESEND_API_KEY && (env.FROM_EMAIL_ADDRESS || env.EMAIL_DOMAIN))
}

/**
 * Security health check - returns overall security posture
 */
export function securityHealthCheck() {
  const validation = validateSecurityConfig()
  const oauthProviders = getConfiguredOAuthProviders()
  const emailConfigured = isEmailConfigured()

  return {
    status: validation.valid ? 'healthy' : 'unhealthy',
    environment: env.NODE_ENV,
    encryptionConfigured: !!env.ENCRYPTION_KEY,
    authConfigured: !!env.BETTER_AUTH_SECRET,
    oauthProviders,
    oauthCount: oauthProviders.length,
    emailConfigured,
    emailVerificationEnabled: !!env.EMAIL_VERIFICATION_ENABLED,
    ssoEnabled: !!env.SSO_ENABLED,
    errors: validation.errors.length,
    warnings: validation.warnings.length,
    details: validation,
  }
}
