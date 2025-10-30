'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DirectBuilderPage() {
  const router = useRouter()

  useEffect(() => {
    // Direct redirect to workflow builder with dummy IDs
    // Generate a random workflow ID so it doesn't conflict
    const dummyWorkflowId = `demo-${Date.now()}`
    router.replace(`/workspace/demo/w/${dummyWorkflowId}`)
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Loading Agent Builder...
        </h1>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  )
}
