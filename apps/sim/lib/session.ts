/**
 * Session Utilities for Standalone Mode
 *
 * Provides helpers to retrieve session/user information that work
 * in both normal and standalone modes.
 */

import { auth } from '@/lib/auth'
import { getStandaloneUser, isStandaloneModeEnabled } from '@/lib/standalone'
import type { Session, User } from 'better-auth'

export interface StandaloneSession {
  session: Session
  user: User
}

/**
 * Get the current session, supporting both normal and standalone modes
 */
export async function getSession(headers: Headers): Promise<StandaloneSession | null> {
  // Standalone mode: return mock session
  if (isStandaloneModeEnabled()) {
    const standaloneUser = getStandaloneUser()
    if (!standaloneUser) {
      return null
    }

    return {
      session: {
        id: 'standalone-session',
        userId: standaloneUser.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        token: 'standalone-token',
        ipAddress: '127.0.0.1',
        userAgent: 'Standalone Mode',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      user: {
        id: standaloneUser.id,
        email: standaloneUser.email,
        name: standaloneUser.name,
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  }

  // Normal mode: use Better Auth
  return await auth.api.getSession({ headers })
}

/**
 * Get just the user from the session
 */
export async function getUserFromSession(headers: Headers): Promise<User | null> {
  const session = await getSession(headers)
  return session?.user || null
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(headers: Headers): Promise<{ session: Session; user: User }> {
  const sessionData = await getSession(headers)
  if (!sessionData) {
    throw new Error('Unauthorized')
  }
  return sessionData
}
