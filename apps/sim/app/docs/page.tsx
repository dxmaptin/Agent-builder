'use client'

import { useEffect, useState } from 'react'

interface APIEndpoint {
  method: string
  path: string
  description: string
  queryParams?: string
  requestBody?: any
  response: any
  loading: boolean
  error: string | null
}

export default function APIDocsPage() {
  const [workspaceId, setWorkspaceId] = useState<string>('')
  const [workflowId, setWorkflowId] = useState<string>('')
  const [endpoints, setEndpoints] = useState<Record<string, APIEndpoint>>({
    workspaces: {
      method: 'GET',
      path: '/api/workspaces',
      description: 'Get all workspaces (standalone returns single default workspace)',
      response: null,
      loading: true,
      error: null,
    },
    workflows: {
      method: 'GET',
      path: '/api/workflows',
      description: 'Get all workflows for the workspace',
      queryParams: '?workspaceId={workspaceId}',
      response: null,
      loading: true,
      error: null,
    },
    workflowDetail: {
      method: 'GET',
      path: '/api/workflows/[id]',
      description: 'Get specific workflow with full state',
      response: null,
      loading: true,
      error: null,
    },
    environment: {
      method: 'GET',
      path: '/api/environment',
      description: 'Get environment variables (returns empty in standalone mode)',
      response: null,
      loading: true,
      error: null,
    },
    folders: {
      method: 'GET',
      path: '/api/folders',
      description: 'Get all folders for the workspace',
      queryParams: '?workspaceId={workspaceId}',
      response: null,
      loading: true,
      error: null,
    },
    knowledge: {
      method: 'GET',
      path: '/api/knowledge',
      description: 'Get knowledge base items',
      queryParams: '?workspaceId={workspaceId}',
      response: null,
      loading: true,
      error: null,
    },
    logs: {
      method: 'GET',
      path: '/api/logs',
      description: 'Get workflow execution logs',
      queryParams: '?workspaceId={workspaceId}',
      response: null,
      loading: true,
      error: null,
    },
    webhooks: {
      method: 'GET',
      path: '/api/webhooks',
      description: 'Get webhooks (returns all if no params)',
      response: null,
      loading: true,
      error: null,
    },
  })

  useEffect(() => {
    const fetchAPIs = async () => {
      try {
        // First, get workspaces to find the workspace ID
        const workspacesRes = await fetch('/api/workspaces')
        const workspacesData = await workspacesRes.json()

        setEndpoints((prev) => ({
          ...prev,
          workspaces: { ...prev.workspaces, response: workspacesData, loading: false },
        }))

        const wsId = workspacesData.data?.[0]?.id
        if (wsId) {
          setWorkspaceId(wsId)

          // Fetch workflows
          const workflowsRes = await fetch(`/api/workflows?workspaceId=${wsId}`)
          const workflowsData = await workflowsRes.json()

          setEndpoints((prev) => ({
            ...prev,
            workflows: { ...prev.workflows, response: workflowsData, loading: false },
          }))

          // Get first workflow ID
          const wfId = workflowsData.data?.[0]?.id
          if (wfId) {
            setWorkflowId(wfId)

            // Fetch workflow detail
            const workflowDetailRes = await fetch(`/api/workflows/${wfId}`)
            const workflowDetailData = await workflowDetailRes.json()

            setEndpoints((prev) => ({
              ...prev,
              workflowDetail: {
                ...prev.workflowDetail,
                response: workflowDetailData,
                loading: false,
              },
            }))
          }

          // Fetch folders
          const foldersRes = await fetch(`/api/folders?workspaceId=${wsId}`)
          const foldersData = await foldersRes.json()

          setEndpoints((prev) => ({
            ...prev,
            folders: { ...prev.folders, response: foldersData, loading: false },
          }))

          // Fetch knowledge
          const knowledgeRes = await fetch(`/api/knowledge?workspaceId=${wsId}`)
          const knowledgeData = await knowledgeRes.json()

          setEndpoints((prev) => ({
            ...prev,
            knowledge: { ...prev.knowledge, response: knowledgeData, loading: false },
          }))

          // Fetch logs
          const logsRes = await fetch(`/api/logs?workspaceId=${wsId}`)
          const logsData = await logsRes.json()

          setEndpoints((prev) => ({
            ...prev,
            logs: { ...prev.logs, response: logsData, loading: false },
          }))
        }

        // Fetch environment
        const envRes = await fetch('/api/environment')
        const envData = await envRes.json()

        setEndpoints((prev) => ({
          ...prev,
          environment: { ...prev.environment, response: envData, loading: false },
        }))

        // Fetch webhooks
        const webhooksRes = await fetch('/api/webhooks')
        const webhooksData = await webhooksRes.json()

        setEndpoints((prev) => ({
          ...prev,
          webhooks: { ...prev.webhooks, response: webhooksData, loading: false },
        }))
      } catch (error: any) {
        console.error('Error fetching APIs:', error)
      }
    }

    fetchAPIs()
  }, [])

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Live API Documentation</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Real-time API responses from your standalone instance
          </p>
          {workspaceId && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Workspace ID:</strong> <code className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900">{workspaceId}</code>
              </p>
              {workflowId && (
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  <strong>Sample Workflow ID:</strong> <code className="rounded bg-blue-100 px-2 py-1 dark:bg-blue-900">{workflowId}</code>
                </p>
              )}
            </div>
          )}
        </div>

        {Object.entries(endpoints).map(([key, endpoint]) => (
          <section key={key} className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded px-3 py-1 text-sm font-semibold ${getMethodColor(endpoint.method)}`}>
                {endpoint.method}
              </span>
              <code className="text-lg font-mono text-gray-900 dark:text-gray-100">{endpoint.path}</code>
            </div>

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{endpoint.description}</p>

            {endpoint.queryParams && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Query Parameters:</h4>
                <div className="rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <code className="text-xs text-gray-800 dark:text-gray-200">
                    {endpoint.queryParams.replace('{workspaceId}', workspaceId)}
                  </code>
                </div>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Live Response:
                </h4>
                {endpoint.loading && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">Loading...</span>
                )}
                {endpoint.error && (
                  <span className="text-xs text-red-600 dark:text-red-400">Error: {endpoint.error}</span>
                )}
                {!endpoint.loading && !endpoint.error && endpoint.response && (
                  <span className="text-xs text-green-600 dark:text-green-400">✓ Loaded</span>
                )}
              </div>
              <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
                {endpoint.loading ? (
                  <span className="text-gray-400">Fetching data...</span>
                ) : endpoint.error ? (
                  <span className="text-red-400">{endpoint.error}</span>
                ) : (
                  JSON.stringify(endpoint.response, null, 2)
                )}
              </pre>
            </div>
          </section>
        ))}

        {/* Standalone Mode Info */}
        <section className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="mb-4 text-2xl font-semibold text-blue-900 dark:text-blue-100">
            Standalone Mode Active
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>All authentication bypassed - no session required</li>
            <li>Default user and workspace auto-created</li>
            <li>All data scoped to standalone workspace</li>
            <li>This page fetches REAL data from your APIs</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
