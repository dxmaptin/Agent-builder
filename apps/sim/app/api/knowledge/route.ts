import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { createKnowledgeBase, getKnowledgeBases } from '@/lib/knowledge/service'
import { createLogger } from '@/lib/logs/console/logger'
import { getStandaloneUser, isStandaloneModeEnabled } from '@/lib/standalone'
import { generateRequestId } from '@/lib/utils'

const logger = createLogger('KnowledgeBaseAPI')

const CreateKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  workspaceId: z.string().optional(),
  embeddingModel: z.literal('text-embedding-3-small').default('text-embedding-3-small'),
  embeddingDimension: z.literal(1536).default(1536),
  chunkingConfig: z
    .object({
      maxSize: z.number().min(100).max(4000).default(1024),
      minSize: z.number().min(1).max(2000).default(1),
      overlap: z.number().min(0).max(500).default(200),
    })
    .default({
      maxSize: 1024,
      minSize: 1,
      overlap: 200,
    })
    .refine((data) => data.minSize < data.maxSize, {
      message: 'Min chunk size must be less than max chunk size',
    }),
})

export async function GET(req: NextRequest) {
  const requestId = generateRequestId()

  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspaceId')

    // Check standalone mode first
    if (isStandaloneModeEnabled()) {
      const standaloneUser = await getStandaloneUser()
      if (!standaloneUser) {
        return NextResponse.json({ error: 'Standalone user not initialized' }, { status: 500 })
      }

      // Get knowledge bases for standalone user
      const knowledgeBasesWithCounts = await getKnowledgeBases(standaloneUser.id, workspaceId)

      return NextResponse.json({
        success: true,
        data: knowledgeBasesWithCounts,
      })
    }

    const session = await getSession()
    if (!session?.user?.id) {
      logger.warn(`[${requestId}] Unauthorized knowledge base access attempt`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBasesWithCounts = await getKnowledgeBases(session.user.id, workspaceId)

    return NextResponse.json({
      success: true,
      data: knowledgeBasesWithCounts,
    })
  } catch (error) {
    logger.error(`[${requestId}] Error fetching knowledge bases`, error)
    return NextResponse.json({ error: 'Failed to fetch knowledge bases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()

  try {
    const body = await req.json()

    // Check standalone mode first
    if (isStandaloneModeEnabled()) {
      const standaloneUser = await getStandaloneUser()
      if (!standaloneUser) {
        return NextResponse.json({ error: 'Standalone user not initialized' }, { status: 500 })
      }

      // In standalone mode, verify workspace if provided
      const { workspaceId } = body
      if (workspaceId && workspaceId !== standaloneUser.workspaceId) {
        return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
      }

      try {
        const validatedData = CreateKnowledgeBaseSchema.parse(body)

        const createData = {
          ...validatedData,
          userId: standaloneUser.id,
        }

        const newKnowledgeBase = await createKnowledgeBase(createData, requestId)

        logger.info(
          `[${requestId}] Knowledge base created: ${newKnowledgeBase.id} for standalone user ${standaloneUser.id}`
        )

        return NextResponse.json({
          success: true,
          data: newKnowledgeBase,
        })
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          logger.warn(`[${requestId}] Invalid knowledge base data`, {
            errors: validationError.errors,
          })
          return NextResponse.json(
            { error: 'Invalid request data', details: validationError.errors },
            { status: 400 }
          )
        }
        throw validationError
      }
    }

    const session = await getSession()
    if (!session?.user?.id) {
      logger.warn(`[${requestId}] Unauthorized knowledge base creation attempt`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const validatedData = CreateKnowledgeBaseSchema.parse(body)

      const createData = {
        ...validatedData,
        userId: session.user.id,
      }

      const newKnowledgeBase = await createKnowledgeBase(createData, requestId)

      logger.info(
        `[${requestId}] Knowledge base created: ${newKnowledgeBase.id} for user ${session.user.id}`
      )

      return NextResponse.json({
        success: true,
        data: newKnowledgeBase,
      })
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        logger.warn(`[${requestId}] Invalid knowledge base data`, {
          errors: validationError.errors,
        })
        return NextResponse.json(
          { error: 'Invalid request data', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }
  } catch (error) {
    logger.error(`[${requestId}] Error creating knowledge base`, error)
    return NextResponse.json({ error: 'Failed to create knowledge base' }, { status: 500 })
  }
}
