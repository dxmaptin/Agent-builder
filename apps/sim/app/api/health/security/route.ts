/**
 * Security Health Check API Route
 *
 * GET /api/health/security
 *
 * Returns security configuration status and OAuth provider availability.
 * Does NOT expose sensitive values.
 */

import { securityHealthCheck } from '@/lib/security/env-validator'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const health = securityHealthCheck()

    // Remove sensitive details from response
    const sanitized = {
      status: health.status,
      environment: health.environment,
      checks: {
        encryptionConfigured: health.encryptionConfigured,
        authConfigured: health.authConfigured,
        emailConfigured: health.emailConfigured,
        emailVerificationEnabled: health.emailVerificationEnabled,
        ssoEnabled: health.ssoEnabled,
      },
      oauth: {
        configured: health.oauthCount > 0,
        providerCount: health.oauthCount,
        providers: health.oauthProviders,
      },
      issues: {
        errors: health.errors,
        warnings: health.warnings,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(sanitized, {
      status: health.status === 'healthy' ? 200 : 500,
    })
  } catch (error) {
    console.error('Security health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to perform security health check',
      },
      { status: 500 }
    )
  }
}
