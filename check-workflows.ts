import { db } from '@sim/db'
import { workflow, knowledgeBase } from '@sim/db/schema'
import { eq } from 'drizzle-orm'

const workspaceId = 'e2cfa967-e9c5-47ef-8611-96e824769280'

console.log('Checking workflows...')
const workflows = await db
  .select()
  .from(workflow)
  .where(eq(workflow.workspaceId, workspaceId))

console.log(`Found ${workflows.length} workflows:`)
console.log(JSON.stringify(workflows, null, 2))

console.log('\nChecking knowledge bases...')
const knowledgeBases = await db
  .select()
  .from(knowledgeBase)
  .where(eq(knowledgeBase.workspaceId, workspaceId))

console.log(`Found ${knowledgeBases.length} knowledge bases:`)
console.log(JSON.stringify(knowledgeBases, null, 2))

process.exit(0)
