'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LoadingAgent } from '@/components/ui/loading-agent'

export default function WorkflowsPage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        console.log('[WorkflowsPage] Fetching workflows for workspace:', workspaceId)

        // Fetch workflows directly from API
        const response = await fetch(`/api/workflows?workspaceId=${workspaceId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch workflows: ${response.statusText}`)
        }

        const { data } = await response.json()

        console.log('[WorkflowsPage] Received workflow data:', {
          hasData: !!data,
          isArray: Array.isArray(data),
          count: data?.length,
          workflows: data,
        })

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.error('[WorkflowsPage] No workflows found!')
          setError('No workflows found for this workspace')
          return
        }

        // Get first workflow from the list
        const firstWorkflow = data[0]
        console.log('[WorkflowsPage] Redirecting to first workflow:', firstWorkflow.id)

        // Redirect to the first workflow
        router.replace(`/workspace/${workspaceId}/w/${firstWorkflow.id}`)
      } catch (error) {
        console.error('[WorkflowsPage] Error fetching workflows:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Run the fetch and redirect
    fetchAndRedirect()
  }, [workspaceId, router])

  // Show loading state or error
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <div className='mx-auto mb-4'>
          <LoadingAgent size='lg' />
        </div>
        {error && (
          <p className='text-sm text-red-500 mt-4'>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
