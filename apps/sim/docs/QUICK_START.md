# Quick Start Guide - Local Development

## Creating Your First Account

Since you're running locally, you need to create an account to access the agent builder. Don't worry - it's quick and easy!

### Step 1: Create an Account

1. Open your browser to: **http://localhost:3000**
2. You'll be redirected to `/login`
3. Click **"Sign Up"** or go to **http://localhost:3000/signup**
4. Fill in:
   - **Email:** any email (doesn't need to be real for local dev)
   - **Password:** any password you'll remember
   - **Name:** your name

**Note:** For local development, email verification is DISABLED by default, so you can use any email address like `test@test.com`.

### Step 2: Access the Agent Builder

Once logged in, you'll be redirected to `/workspace` where you can:
- Create AI agent workflows
- Build automation pipelines
- Use the copilot feature
- Test your OpenAI integration

## Navigation Guide

### Main Areas

1. **Workspace** (`/workspace`)
   - Your main dashboard
   - View all your workflows
   - Create new agents

2. **Workflow Builder** (`/workspace/{id}/w/{workflowId}`)
   - Drag-and-drop interface
   - Add Agent blocks (powered by your OpenAI key!)
   - Connect tools and actions
   - Test executions

3. **Copilot** (accessible from workflows)
   - AI assistant to help build workflows
   - Uses your OpenAI configuration

### Key Features to Try

1. **Agent Block** - Your main LLM interaction
   - Add system/user prompts
   - Call tools
   - Get structured output

2. **Router Block** - Conditional logic
   - LLM-based routing decisions

3. **Evaluator Block** - Quality assessment
   - Evaluate LLM outputs

4. **Tools** - Extend agent capabilities
   - Web scraping
   - API calls
   - Data transformations

## Fixing the Source Map Error

The console error you're seeing is a known Next.js development issue and doesn't affect functionality. To reduce noise, you can:

1. Ignore it (it's harmless in dev mode)
2. Or clear Next.js cache:
   ```bash
   rm -rf apps/sim/.next
   bun run dev:full
   ```

## Quick Test Workflow

Once logged in, try this:

1. **Create a new workflow**
2. **Add an Agent block**
3. **Configure it:**
   - Model: `gpt-4o-mini` (cheaper for testing)
   - System prompt: "You are a helpful assistant"
   - User prompt: "Say hello!"
4. **Run it** - You'll see your OpenAI API in action!

## Troubleshooting

### "Database Error"
Your DATABASE_URL might have special characters. It's already set in your `.env` but if you see issues, let me know.

### "OpenAI API Error"
- Check your API key is correct in `.env`
- Ensure you have credits at https://platform.openai.com/account/billing

### Can't Access /workspace
- You must be logged in
- Create an account first at http://localhost:3000/signup

## No Login Option?

Unfortunately, there's no "skip auth" mode for local development because:
- Workflows are tied to user accounts
- Workspaces require authentication
- It's a multi-user system by design

But creating a local account takes only 30 seconds! 🚀

## Environment Configuration

Your current setup:
- ✅ OpenAI API configured
- ✅ Security keys generated
- ✅ Database connected
- ✅ Server running on http://localhost:3000
- ⚠️ Email verification DISABLED (good for local dev)
- ⚠️ Registration ENABLED (you can create accounts)

## Next Steps

1. Go to http://localhost:3000/signup
2. Create account with any email (test@test.com works!)
3. Start building AI workflows!

The agent builder is production-ready and your OpenAI integration is live!
