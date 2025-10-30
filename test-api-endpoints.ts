/**
 * API Endpoint Tester for Standalone Mode
 * Tests all critical endpoints to identify permission issues
 */

const BASE_URL = 'http://localhost:3000'
const WORKSPACE_ID = 'e2cfa967-e9c5-47ef-8611-96e824769280'

interface TestResult {
  endpoint: string
  method: string
  status: number
  ok: boolean
  error?: string
  data?: any
}

const results: TestResult[] = []

async function testEndpoint(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json().catch(() => null)

    const result: TestResult = {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
      data,
    }

    if (!response.ok) {
      result.error = data?.error || response.statusText
    }

    results.push(result)
    return result
  } catch (error: any) {
    const result: TestResult = {
      endpoint,
      method,
      status: 0,
      ok: false,
      error: error.message,
    }
    results.push(result)
    return result
  }
}

function printResult(result: TestResult) {
  const icon = result.ok ? '✅' : '❌'
  const status = result.status === 0 ? 'ERROR' : result.status
  console.log(`${icon} [${result.method}] ${result.endpoint} - ${status}`)
  if (result.error) {
    console.log(`   Error: ${result.error}`)
  }
  if (result.data && !result.ok) {
    console.log(`   Data:`, JSON.stringify(result.data, null, 2))
  }
}

async function runTests() {
  console.log('\n🧪 Testing API Endpoints in Standalone Mode\n')
  console.log('=' .repeat(60))

  // Core Workflow Endpoints
  console.log('\n📋 WORKFLOWS (Critical)')
  await testEndpoint(`/api/workflows?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)
  await testEndpoint(`/api/workflows`, 'POST', {
    name: 'Test Workflow',
    workspaceId: WORKSPACE_ID,
  }).then(printResult)

  // Workspace Endpoints
  console.log('\n🏢 WORKSPACES (Critical)')
  await testEndpoint(`/api/workspaces`, 'GET').then(printResult)
  await testEndpoint(`/api/workspaces/${WORKSPACE_ID}`, 'GET').then(printResult)
  await testEndpoint(`/api/workspaces/${WORKSPACE_ID}`, 'PATCH', {
    name: 'Updated Workspace',
  }).then(printResult)

  // Folders Endpoints
  console.log('\n📁 FOLDERS (Critical)')
  await testEndpoint(`/api/folders?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)
  await testEndpoint(`/api/folders`, 'POST', {
    name: 'Test Folder',
    workspaceId: WORKSPACE_ID,
  }).then(printResult)

  // Knowledge Base Endpoints
  console.log('\n📚 KNOWLEDGE (Critical)')
  await testEndpoint(`/api/knowledge?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)
  await testEndpoint(`/api/knowledge`, 'POST', {
    name: 'Test Knowledge Base',
    workspaceId: WORKSPACE_ID,
  }).then(printResult)

  // Schedules Endpoints
  console.log('\n⏰ SCHEDULES (Important)')
  await testEndpoint(`/api/schedules?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)

  // Webhooks Endpoints
  console.log('\n🔗 WEBHOOKS (Important)')
  await testEndpoint(`/api/webhooks?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)

  // Logs Endpoints
  console.log('\n📊 LOGS (Important)')
  await testEndpoint(
    `/api/logs?workspaceId=${WORKSPACE_ID}&details=basic&limit=10&offset=0`,
    'GET'
  ).then(printResult)

  // Environment Variables
  console.log('\n🔐 ENVIRONMENT (Important)')
  await testEndpoint(`/api/environment?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)

  // Tools
  console.log('\n🛠️  TOOLS (Optional)')
  await testEndpoint(`/api/tools/custom?workspaceId=${WORKSPACE_ID}`, 'GET').then(printResult)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 SUMMARY\n')

  const passed = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n🔥 FAILED ENDPOINTS:\n')
    results
      .filter((r) => !r.ok)
      .forEach((r) => {
        console.log(`  • [${r.method}] ${r.endpoint} - ${r.status} ${r.error || ''}`)
      })
  }

  console.log('\n' + '='.repeat(60))
}

// Run tests
runTests().catch(console.error)
