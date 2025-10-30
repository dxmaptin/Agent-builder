#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function createProperWorkflow() {
  try {
    const workflowId = crypto.randomUUID()
    const userId = '4388b465-094c-4088-a12a-1e3d0f40838b'
    const workspaceId = 'e2cfa967-e9c5-47ef-8611-96e824769280'
    const now = new Date()

    console.log('Creating workflow with proper structure...')
    console.log('Workflow ID:', workflowId)

    // Insert workflow
    await sql`
      INSERT INTO workflow (
        id, user_id, workspace_id, folder_id, name, description, color,
        last_synced, created_at, updated_at, is_deployed, deployed_state,
        deployed_at, pinned_api_key_id, collaborators, run_count, last_run_at,
        variables, is_published, marketplace_data
      ) VALUES (
        ${workflowId}, ${userId}, ${workspaceId}, null, 'Working Workflow',
        'A workflow with proper structure', '#00FF00',
        ${now}, ${now}, ${now}, false, null, null, null, '[]'::json, 0, null,
        '{}'::json, false, null
      )
    `

    console.log('✅ Workflow created!')
    console.log('\nNow open this URL in your browser:')
    console.log(`http://localhost:3000/workspace/${workspaceId}/w/${workflowId}`)

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  } finally {
    await sql.end()
  }
}

createProperWorkflow()
