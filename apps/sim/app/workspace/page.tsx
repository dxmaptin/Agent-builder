'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingAgent } from '@/components/ui/loading-agent'
import { useSession } from '@/lib/auth-client'
import { createLogger } from '@/lib/logs/console/logger'

const logger = createLogger('WorkspacePage')

// Check if standalone mode is enabled (client-side check)
const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false
  // Check if we can access workspace without auth - middleware will allow it
  return true // We'll let the API calls determine this
}

export default function WorkspacePage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Helper to add debug messages
  const addDebug = (message: string) => {
    console.log(`[WORKSPACE DEBUG] ${message}`)
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    const redirectToFirstWorkspace = async () => {
      addDebug('=== STARTING WORKSPACE REDIRECT LOGIC ===')
      addDebug(`isPending: ${isPending}`)
      addDebug(`session: ${JSON.stringify(session)}`)
      addDebug(`session?.user: ${JSON.stringify(session?.user)}`)

      // Wait for session to load
      if (isPending) {
        addDebug('Session is still pending, waiting...')
        return
      }

      // In standalone mode, session might be null but middleware allows access
      // Try to fetch workspaces first before redirecting to login
      if (!session?.user) {
        addDebug('⚠️ No session.user found - checking if standalone mode...')

        // Try to fetch workspaces anyway - if standalone mode is enabled, API will work
        try {
          addDebug('Attempting to fetch workspaces without session...')
          const testResponse = await fetch('/api/workspaces')
          addDebug(`Workspaces API response status: ${testResponse.status}`)

          if (testResponse.ok) {
            addDebug('✅ Workspaces API returned OK - standalone mode is working!')
            // Continue with workspace logic below
          } else {
            addDebug(`❌ Workspaces API failed: ${testResponse.status}`)
            const errorText = await testResponse.text()
            addDebug(`Error response: ${errorText}`)
            logger.info('User not authenticated and not in standalone mode, redirecting to login')
            router.replace('/login')
            return
          }
        } catch (error) {
          addDebug(`❌ Error fetching workspaces: ${error}`)
          logger.error('Error checking workspaces:', error)
          router.replace('/login')
          return
        }
      } else {
        addDebug(`✅ Session user found: ${session.user.email}`)
      }

      try {
        // Check if we need to redirect a specific workflow from old URL format
        const urlParams = new URLSearchParams(window.location.search)
        const redirectWorkflowId = urlParams.get('redirect_workflow')

        if (redirectWorkflowId) {
          addDebug(`Found redirect_workflow param: ${redirectWorkflowId}`)
          // Try to get the workspace for this workflow
          try {
            const workflowResponse = await fetch(`/api/workflows/${redirectWorkflowId}`)
            addDebug(`Workflow API response: ${workflowResponse.status}`)
            if (workflowResponse.ok) {
              const workflowData = await workflowResponse.json()
              const workspaceId = workflowData.data?.workspaceId

              if (workspaceId) {
                addDebug(`Redirecting to workspace ${workspaceId} with workflow ${redirectWorkflowId}`)
                logger.info(
                  `Redirecting workflow ${redirectWorkflowId} to workspace ${workspaceId}`
                )
                router.replace(`/workspace/${workspaceId}/w/${redirectWorkflowId}`)
                return
              }
            }
          } catch (error) {
            addDebug(`Error fetching workflow: ${error}`)
            logger.error('Error fetching workflow for redirect:', error)
          }
        }

        // Fetch user's workspaces
        addDebug('Fetching workspaces from API...')
        const response = await fetch('/api/workspaces')
        addDebug(`Workspaces API response: ${response.status}`)

        if (!response.ok) {
          const errorText = await response.text()
          addDebug(`Workspaces API error: ${errorText}`)
          throw new Error('Failed to fetch workspaces')
        }

        const data = await response.json()
        addDebug(`Workspaces data: ${JSON.stringify(data)}`)
        const workspaces = data.workspaces || []
        addDebug(`Found ${workspaces.length} workspaces`)

        if (workspaces.length === 0) {
          addDebug('No workspaces found, creating default workspace...')
          logger.warn('No workspaces found for user, creating default workspace')

          try {
            const createResponse = await fetch('/api/workspaces', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: 'My Workspace' }),
            })

            addDebug(`Create workspace API response: ${createResponse.status}`)

            if (createResponse.ok) {
              const createData = await createResponse.json()
              addDebug(`Create workspace data: ${JSON.stringify(createData)}`)
              const newWorkspace = createData.workspace

              if (newWorkspace?.id) {
                addDebug(`✅ Created workspace: ${newWorkspace.id}`)
                logger.info(`Created default workspace: ${newWorkspace.id}`)
                router.replace(`/workspace/${newWorkspace.id}/w`)
                return
              }
            } else {
              const errorText = await createResponse.text()
              addDebug(`Create workspace error: ${errorText}`)
            }

            addDebug('❌ Failed to create default workspace')
            logger.error('Failed to create default workspace')
          } catch (createError) {
            addDebug(`❌ Error creating workspace: ${createError}`)
            logger.error('Error creating default workspace:', createError)
          }

          // If we can't create a workspace, redirect to login to reset state
          addDebug('Redirecting to login after failed workspace creation')
          router.replace('/login')
          return
        }

        // Get the first workspace (they should be ordered by most recent)
        const firstWorkspace = workspaces[0]
        addDebug(`First workspace: ${JSON.stringify(firstWorkspace)}`)
        addDebug(`🎯 Redirecting to workspace: ${firstWorkspace.id}`)
        logger.info(`Redirecting to first workspace: ${firstWorkspace.id}`)

        // Redirect to the first workspace
        router.replace(`/workspace/${firstWorkspace.id}/w`)
      } catch (error) {
        addDebug(`❌ CRITICAL ERROR: ${error}`)
        logger.error('Error fetching workspaces for redirect:', error)
        // Don't redirect if there's an error - let the user stay on the page
      }
    }

    // Only run this logic when we're at the root /workspace path
    // If we're already in a specific workspace, the children components will handle it
    if (typeof window !== 'undefined' && window.location.pathname === '/workspace') {
      addDebug(`Current pathname: ${window.location.pathname}`)
      redirectToFirstWorkspace()
    }
  }, [session, isPending, router])

  // Show loading state while we determine where to redirect
  if (isPending) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600'>
        <div className='flex flex-col items-center justify-center text-center align-middle'>
          <h1 className='text-4xl font-bold text-white mb-4'>Loading Session...</h1>
          <LoadingAgent size='lg' />
          <p className='text-white mt-4'>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show debug info and "Hello World" while redirecting
  return (
    <div className='flex h-screen w-full items-center justify-center bg-gradient-to-br from-green-600 to-teal-600'>
      <div className='max-w-4xl p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-6xl font-bold text-white mb-4'>
            🎉 HELLO WORLD! 🎉
          </h1>
          <p className='text-2xl text-white mb-4'>
            Workspace Page is Loading...
          </p>
          <div className='bg-white rounded-lg p-6 shadow-2xl'>
            <h2 className='text-2xl font-bold mb-4 text-gray-800'>
              Debug Information
            </h2>
            <div className='text-left space-y-2'>
              <p className='text-sm text-gray-700'>
                <strong>Session Status:</strong> {session ? '✅ Active' : '❌ No Session'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>User:</strong> {session?.user?.email || 'Not authenticated'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Pending:</strong> {isPending ? 'Yes' : 'No'}
              </p>
              <p className='text-sm text-gray-700'>
                <strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Debug Console */}
        <div className='bg-black rounded-lg p-4 shadow-2xl max-h-96 overflow-y-auto'>
          <h3 className='text-xl font-bold text-green-400 mb-2'>🔍 Debug Console</h3>
          <div className='font-mono text-xs space-y-1'>
            {debugInfo.length === 0 ? (
              <p className='text-gray-400'>No debug messages yet...</p>
            ) : (
              debugInfo.map((msg, idx) => (
                <p key={idx} className='text-green-300'>{msg}</p>
              ))
            )}
          </div>
        </div>

        <div className='text-center mt-6'>
          <LoadingAgent size='lg' />
          <p className='text-white mt-4'>Redirecting to your workspace...</p>
        </div>
      </div>
    </div>
  )
}
