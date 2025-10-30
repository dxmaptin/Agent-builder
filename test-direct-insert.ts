#!/usr/bin/env bun

import postgres from 'postgres'

const DATABASE_URL = "postgresql://postgres.wxtbrpailwudeftuynzp:Xk9%24mP7%23nQ2%40vL5%26wR8%21zT3%5EbN6@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const sql = postgres(DATABASE_URL)

async function testInsert() {
  try {
    console.log('Testing direct workflow insert...\n')

    const workflowId = crypto.randomUUID()
    const userId = '4388b465-094c-4088-a12a-1e3d0f40838b'
    const workspaceId = 'e2cfa967-e9c5-47ef-8611-96e824769280'
    const now = new Date()

    console.log('Inserting with ID:', workflowId)
    console.log('User ID:', userId)
    console.log('Workspace ID:', workspaceId)
    console.log()

    // Try the exact same INSERT that the code is doing
    const result = await sql`
      INSERT INTO workflow (
        id, user_id, workspace_id, folder_id, name, description, color,
        last_synced, created_at, updated_at
      ) VALUES (
        ${workflowId}, ${userId}, ${workspaceId}, null, 'Test Workflow', '', '#3972F6',
        ${now}, ${now}, ${now}
      )
      RETURNING *
    `

    console.log('✅ INSERT successful!')
    console.log('Result:', result[0])

  } catch (error: any) {
    console.error('❌ INSERT failed!')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error detail:', error.detail)
    console.error('Error hint:', error.hint)
    console.error('Error constraint:', error.constraint)
    console.error('\nFull error:', error)
  } finally {
    await sql.end()
  }
}

testInsert()
