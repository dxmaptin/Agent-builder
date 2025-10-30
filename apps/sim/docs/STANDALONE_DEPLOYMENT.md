# Standalone In-House Deployment Plan

## 🎯 Goal
Run the AI Agent Builder completely standalone without external authentication, fully self-hosted with your own infrastructure.

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Standalone Deployment                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │  PostgreSQL  │  │  LLM Provider│     │
│  │  (Frontend)  │──│  (Your DB)   │  │  (OpenAI)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Socket.io  │  │    Redis     │  │  S3/MinIO    │     │
│  │  (Realtime)  │  │  (Optional)  │  │ (File Store) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         ▲
         │
    [No External Auth - Direct Access]
```

## 🔧 Implementation Strategy

### Phase 1: Disable Authentication (Quick Win)

#### Option A: Auto-Login Mode (Recommended)
Create a default user that's automatically logged in:

**Implementation:**
1. Add environment variable: `STANDALONE_MODE=true`
2. Modify middleware to auto-create session for standalone mode
3. Create default user on first startup
4. Skip all auth checks when standalone mode enabled

**Pros:**
- Quick to implement (30 min)
- Minimal code changes
- Keeps user/workspace system intact (needed for workflows)

**Cons:**
- Still uses database for user storage
- Single user system only

#### Option B: Complete Auth Bypass
Remove authentication entirely:

**Implementation:**
1. Stub out all `getSession()` calls
2. Hard-code a default user ID
3. Disable middleware auth checks
4. Remove login/signup routes

**Pros:**
- Truly standalone
- No auth dependencies

**Cons:**
- More invasive changes
- Breaks multi-user features
- Need to maintain fork

### Phase 2: Self-Hosted Infrastructure

All components run on YOUR infrastructure:

#### 1. Database (PostgreSQL)
```yaml
# Already configured in your .env
DATABASE_URL=postgresql://user:pass@YOUR_SERVER:5432/simdb

# Options:
- Docker: postgres:16-alpine
- Managed: AWS RDS, Azure Database, Google Cloud SQL
- Self-hosted: Install PostgreSQL on your server
```

#### 2. File Storage
```yaml
# Option A: MinIO (S3-compatible, self-hosted)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_minio_access_key
AWS_SECRET_ACCESS_KEY=your_minio_secret
S3_BUCKET_NAME=sim-files
# Point to your MinIO server
AWS_ENDPOINT=http://your-minio-server:9000

# Option B: Local filesystem (simpler)
STORAGE_TYPE=local
STORAGE_PATH=/var/lib/sim/files
```

#### 3. LLM Provider
```yaml
# Self-hosted option (completely in-house)
OLLAMA_URL=http://your-internal-server:11434

# Or use OpenAI (as you have now)
OPENAI_API_KEY=sk-proj-...

# Or Azure OpenAI (private deployment)
AZURE_OPENAI_ENDPOINT=https://your-azure.openai.azure.com/
AZURE_OPENAI_API_KEY=your_key
```

#### 4. Redis (Optional - for caching)
```yaml
REDIS_URL=redis://your-redis-server:6379
```

### Phase 3: Containerization (Docker)

Full containerized deployment:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Main application
  sim-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - STANDALONE_MODE=true
      - DATABASE_URL=postgresql://sim:password@postgres:5432/simdb
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OLLAMA_URL=http://ollama:11434
    depends_on:
      - postgres
      - ollama
      - minio

  # PostgreSQL database
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=sim
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=simdb

  # Local LLM (optional)
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  # File storage
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"

  # Redis (optional)
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  ollama_data:
  minio_data:
  redis_data:
```

## 🚀 Quick Implementation: Standalone Mode

Let me implement Option A (Auto-Login) right now:

### Files to Create/Modify:

1. **Add environment variable:**
   ```bash
   # .env
   STANDALONE_MODE=true
   STANDALONE_USER_EMAIL=admin@localhost
   STANDALONE_USER_NAME=Admin User
   ```

2. **Modify middleware.ts:**
   - Skip auth checks if standalone mode
   - Auto-inject session

3. **Create initialization script:**
   - Auto-create default user on startup
   - Auto-create default workspace

4. **Update auth.ts:**
   - Add standalone mode session provider

## 📦 Deployment Options

### Option 1: Single Docker Container
```bash
docker build -t sim-agent-builder .
docker run -p 3000:3000 \
  -e STANDALONE_MODE=true \
  -e DATABASE_URL=postgresql://... \
  -e OPENAI_API_KEY=sk-... \
  sim-agent-builder
```

### Option 2: Docker Compose (Full Stack)
```bash
# Everything in-house: App + DB + LLM + Storage
docker-compose up -d
```

### Option 3: Kubernetes (Enterprise)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sim-agent-builder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sim
  template:
    metadata:
      labels:
        app: sim
    spec:
      containers:
      - name: sim
        image: your-registry/sim:latest
        env:
        - name: STANDALONE_MODE
          value: "true"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sim-secrets
              key: database-url
```

## 🔒 Security Considerations

### For Standalone Deployment:

1. **Network Isolation:**
   ```bash
   # Only accessible from internal network
   firewall-cmd --add-rich-rule='rule family="ipv4" source address="10.0.0.0/8" port port="3000" protocol="tcp" accept'
   ```

2. **Encryption:**
   - Use TLS/SSL (nginx reverse proxy)
   - Encrypt database connections
   - Secure API keys in vault

3. **Access Control:**
   - VPN required for access
   - IP whitelisting
   - Internal DNS only

## 📊 Cost Breakdown (In-House vs SaaS)

| Component | SaaS | Self-Hosted |
|-----------|------|-------------|
| **Auth Service** | $50-500/mo | $0 (removed) |
| **Database** | $50-200/mo | $20-100/mo (your server) |
| **LLM Provider** | OpenAI costs | Ollama (free) or OpenAI |
| **File Storage** | $20-100/mo | MinIO (free) |
| **Hosting** | N/A | Your infrastructure |
| **Total** | $120-800/mo | $20-100/mo + infra |

## ⚡ Quick Start: I'll Implement Now

Shall I implement the standalone mode for you right now? It will:

1. ✅ Add `STANDALONE_MODE=true` flag
2. ✅ Bypass all authentication
3. ✅ Auto-create default user/workspace
4. ✅ Direct access to `/workspace` without login
5. ✅ Keep all features working (workflows, copilot, etc.)

This takes about 15-20 minutes to implement and test.

## 🎯 What You'll Get

After implementation:
- Open http://localhost:3000 → Goes directly to workspace
- No login required
- Single-user system (perfect for in-house)
- All AI features work
- Completely self-contained

**Ready to implement? Say yes and I'll modify the code now!**
