/**
 * Standalone Mode Initialization
 *
 * This module handles the automatic setup of default user and workspace
 * when running in standalone mode (no authentication required).
 */

import { db } from '@sim/db'
import * as schema from '@sim/db/schema'
import { eq } from 'drizzle-orm'
import { env, isTruthy } from './env'
import { createLogger } from './logs/console/logger'

const logger = createLogger('StandaloneInit')

export interface StandaloneUser {
  id: string
  email: string
  name: string
  workspaceId: string
  workspaceName: string
}

let cachedStandaloneUser: StandaloneUser | null = null

/**
 * Get or create the standalone mode default user and workspace
 */
export async function initializeStandaloneMode(): Promise<StandaloneUser | null> {
  if (!isTruthy(env.STANDALONE_MODE)) {
    return null
  }

  // Return cached user if already initialized
  if (cachedStandaloneUser) {
    return cachedStandaloneUser
  }

  try {
    const email = env.STANDALONE_USER_EMAIL || 'admin@localhost'
    const name = env.STANDALONE_USER_NAME || 'Admin User'
    const workspaceName = env.STANDALONE_WORKSPACE_NAME || 'Default Workspace'

    logger.info('Initializing standalone mode', { email, name, workspaceName })

    // Check if user already exists (simple query without relationships)
    const existingUsers = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1)

    let userId: string
    let workspaceId: string

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      logger.info('Standalone user already exists', { userId: existingUser.id })
      userId = existingUser.id

      // Find user's workspace (simple query without relationships)
      const userMemberships = await db
        .select()
        .from(schema.member)
        .where(eq(schema.member.userId, userId))
        .limit(1)

      if (userMemberships.length > 0) {
        workspaceId = userMemberships[0].organizationId
        logger.info('Found existing workspace', { workspaceId })
      } else {
        // Create workspace if it doesn't exist
        const [workspace] = await db
          .insert(schema.organization)
          .values({
            name: workspaceName,
            slug: 'default',
            metadata: { standaloneMode: true },
          })
          .returning()

        workspaceId = workspace.id

        // Add user to workspace as owner
        await db.insert(schema.member).values({
          userId,
          organizationId: workspaceId,
          role: 'owner',
        })

        logger.info('Created new workspace', { workspaceId })
      }
    } else {
      // Create new user
      const [newUser] = await db
        .insert(schema.user)
        .values({
          email,
          name,
          emailVerified: true, // Auto-verify in standalone mode
        })
        .returning()

      userId = newUser.id
      logger.info('Created standalone user', { userId })

      // Create default workspace
      const [workspace] = await db
        .insert(schema.organization)
        .values({
          name: workspaceName,
          slug: 'default',
          metadata: { standaloneMode: true },
        })
        .returning()

      workspaceId = workspace.id
      logger.info('Created default workspace', { workspaceId })

      // Add user to workspace as owner
      await db.insert(schema.member).values({
        userId,
        organizationId: workspaceId,
        role: 'owner',
      })

      logger.info('Standalone mode initialized successfully')
    }

    // Cache the result
    cachedStandaloneUser = {
      id: userId,
      email,
      name,
      workspaceId,
      workspaceName,
    }

    logger.info('Standalone user cached successfully', cachedStandaloneUser)
    return cachedStandaloneUser
  } catch (error) {
    logger.error('Failed to initialize standalone mode', { error })
    // Don't throw - just log and return null so the app can still start
    return null
  }
}

/**
 * Get the cached standalone user, or try to initialize if not cached
 */
export async function getStandaloneUser(): Promise<StandaloneUser | null> {
  if (cachedStandaloneUser) {
    return cachedStandaloneUser
  }

  // Try to initialize if not cached yet
  if (isTruthy(env.STANDALONE_MODE)) {
    return await initializeStandaloneMode()
  }

  return null
}

/**
 * Check if standalone mode is enabled
 */
export function isStandaloneModeEnabled(): boolean {
  return isTruthy(env.STANDALONE_MODE)
}
