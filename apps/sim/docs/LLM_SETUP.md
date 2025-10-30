# LLM Provider Setup - Quick Start Guide

## ⚠️ IMPORTANT: Your app won't work without an LLM provider!

This application is an AI workflow builder that **requires at least one LLM (Large Language Model) provider** to function. Without it, the application cannot process AI agent requests, run workflows, or use the copilot feature.

## Quick Setup (Choose One)

### 🚀 Fastest: OpenAI (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and add payment method ($5 minimum)
3. Create a new API key
4. Add to your `.env` file:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

**Cost:** ~$0.01-$0.06 per 1,000 tokens (very affordable for development)

### 💰 Free Option: Ollama (Local)

Perfect for development with no API costs!

1. Install Ollama:
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh

   # Or download from https://ollama.com
   ```

2. Pull a model:
   ```bash
   ollama pull llama2
   # or
   ollama pull mistral
   ```

3. Add to your `.env` file:
   ```bash
   OLLAMA_URL=http://localhost:11434
   ```

**Pros:** Free, private, no rate limits
**Cons:** Requires good hardware (8GB+ RAM), slower than cloud APIs

### 🎯 High Quality: Anthropic Claude

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account and add credits ($5 minimum)
3. Create API key
4. Add to your `.env` file:
   ```bash
   ANTHROPIC_API_KEY_1=sk-ant-your-key-here
   ```

**Best for:** Complex reasoning, coding assistance, long contexts

## Comparison Table

| Provider | Cost | Speed | Quality | Setup Time | Best For |
|----------|------|-------|---------|------------|----------|
| **OpenAI** | $$ | ⚡⚡⚡ | ⭐⭐⭐⭐ | 2 min | Most users |
| **Anthropic** | $$ | ⚡⚡ | ⭐⭐⭐⭐⭐ | 2 min | Complex tasks |
| **Ollama** | FREE | ⚡ | ⭐⭐⭐ | 5 min | Development |
| **Mistral** | $ | ⚡⚡⚡ | ⭐⭐⭐ | 2 min | Budget-conscious |
| **Azure OpenAI** | $$$ | ⚡⚡⚡ | ⭐⭐⭐⭐ | 15 min | Enterprise |

## What Each Provider Powers

Your LLM provider is used for:

- 🤖 **Agent blocks** - Core AI processing in workflows
- 🔀 **Router blocks** - Intelligent workflow routing
- 📊 **Evaluator blocks** - Quality assessment
- 🛠️ **Copilot** - AI assistant for building workflows
- 🧠 **Knowledge base** - Embeddings and semantic search
- 🔍 **Guardrails** - Content validation and safety checks

## Multi-Provider Setup (Advanced)

You can configure multiple providers for redundancy and load balancing:

```bash
# Primary provider
OPENAI_API_KEY=sk-proj-key1

# Backup/load balancing
ANTHROPIC_API_KEY_1=sk-ant-key1

# Local for development
OLLAMA_URL=http://localhost:11434
```

The system will automatically use available providers based on:
- Model selection in workflows
- Load balancing configuration
- Failover if primary is unavailable

## Testing Your Setup

After adding your LLM provider, test it:

```bash
# Start your app
npm run dev

# The app should start without errors
# If you see "No LLM provider configured" - check your .env file
```

## Troubleshooting

### "No API key found"
- Check your `.env` file has the correct variable name
- Restart your dev server after adding keys
- Ensure no extra spaces around the `=` sign

### "Invalid API key"
- Verify the key is copied correctly (no spaces/line breaks)
- Check the key hasn't expired or been revoked
- Ensure you have credits/billing set up

### Ollama connection refused
```bash
# Check if Ollama is running
ollama list

# Start Ollama if needed
ollama serve

# Verify you've pulled a model
ollama pull llama2
```

### Rate limiting
- Add multiple API keys for load balancing
- Use OPENAI_API_KEY_1, OPENAI_API_KEY_2, etc.
- Consider Ollama for development to avoid rate limits

## Cost Management Tips

1. **Development:** Use Ollama (free) or GPT-3.5 (cheap)
2. **Production:** Use GPT-4o or Claude 3.5 Sonnet
3. **Load balancing:** Distribute across multiple keys
4. **Monitoring:** Enable billing alerts in provider dashboards
5. **Caching:** The app automatically caches responses where possible

## Getting Help

If you're stuck:
1. Check [docs/SECURITY.md](./SECURITY.md) for detailed setup
2. Verify `.env` file is not committed (it's in .gitignore)
3. Ensure you've restarted the dev server after changes
4. Check provider status pages for outages

## Next Steps

Once your LLM provider is configured:
1. ✅ Start the development server
2. ✅ Create your first workflow
3. ✅ Test an Agent block
4. ✅ Try the Copilot feature

**Remember:** Start with one provider, get it working, then add more if needed!
