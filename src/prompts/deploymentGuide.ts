/**
 * Deployment guide for MCP servers
 */

export async function deploymentGuide(args: {
  deployment_target?: string;
} = {}): Promise<string> {
  const { deployment_target = "local" } = args;
  
  const targetTitle = deployment_target.charAt(0).toUpperCase() + deployment_target.slice(1);
  
  return `# 🚀 MCP Server Deployment Guide

## 🎯 Deploying to ${targetTitle} Environment

This guide covers production deployment strategies for MCP servers across different environments.

## 📍 Local Deployment

### Desktop Application Integration

#### 1. Package for Distribution
` + "```bash" + `
# Python packaging
cd my-mcp-server
uv build

# TypeScript packaging  
npm run build
npm pack
` + "```" + `

#### 2. Claude Desktop Configuration
` + "```json" + `
{
  "mcpServers": {
    "your-server-name": {
      "command": "python",
      "args": ["-m", "your_package_name"],
      "env": {
        "API_KEY": "user-provided-key",
        "DATA_PATH": "~/Documents/your-app-data"
      }
    }
  }
}
` + "```" + `

#### 3. Installation Script
` + "```bash" + `
#!/bin/bash
# install.sh - One-click installer

set -e

echo "🚀 Installing My MCP Server..."

# Check requirements
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Install package
echo "📦 Installing package..."
pip install --user my-mcp-server

# Configure Claude Desktop
echo "⚙️ Configuring Claude Desktop..."
CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
CONFIG_DIR=$(dirname "$CONFIG_FILE")

mkdir -p "$CONFIG_DIR"

echo "✅ Installation complete!"
echo "Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Look for the MCP tools icon"
echo "3. Try asking Claude to use your server's tools"
` + "```" + `

## ☁️ Cloud Deployment

### Container Deployment (Docker)

#### 1. Create Dockerfile
` + "```dockerfile" + `
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y curl \\
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd --create-home --shell /bin/bash app
USER app
WORKDIR /home/app

# Copy and install
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD python health_check.py || exit 1

EXPOSE 8000
CMD ["python", "-m", "my_mcp_server", "--transport", "http", "--port", "8000"]
` + "```" + `

#### 2. Docker Compose
` + "```yaml" + `
version: '3.8'

services:
  mcp-server:
    build: .
    ports:
      - "8000:8000"
    environment:
      - API_KEY=\${API_KEY}
      - LOG_LEVEL=INFO
    restart: unless-stopped
` + "```" + `

### Serverless Deployment (AWS Lambda)

#### Lambda Function
` + "```python" + `
import json
import asyncio
from my_mcp_server import create_server

def lambda_handler(event, context):
    \"\"\"AWS Lambda handler for MCP server.\"\"\"
    
    try:
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
        
        server = create_server()
        response = asyncio.run(server.handle_request(body))
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'MCP-Protocol-Version': '2025-06-18'
            },
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'jsonrpc': '2.0',
                'error': {
                    'code': -32603,
                    'message': f'Internal server error: {str(e)}'
                }
            })
        }
` + "```" + `

## 🔒 Security and Production Hardening

### Security Configuration
` + "```python" + `
import os
import secrets
import hashlib
from functools import wraps

class SecurityConfig:
    def __init__(self):
        self.api_key_hash = os.getenv("API_KEY_HASH")
        self.rate_limit_per_minute = int(os.getenv("RATE_LIMIT", "100"))
        self.require_auth = os.getenv("REQUIRE_AUTH", "true").lower() == "true"
    
    def validate_api_key(self, provided_key: str) -> bool:
        if not self.api_key_hash or not provided_key:
            return not self.require_auth
        
        provided_hash = hashlib.sha256(provided_key.encode()).hexdigest()
        return secrets.compare_digest(self.api_key_hash, provided_hash)

security = SecurityConfig()

def require_auth(func):
    @wraps(func) 
    async def wrapper(*args, **kwargs):
        api_key = get_request_api_key()
        
        if not security.validate_api_key(api_key):
            raise PermissionError("Invalid API key")
        
        return await func(*args, **kwargs)
    
    return wrapper

@mcp.tool()
@require_auth
async def admin_tool(action: str) -> str:
    \"\"\"Administrative tool requiring authentication.\"\"\"
    return f"Admin action executed: {action}"
` + "```" + `

## 📊 Monitoring and Observability

### Application Metrics
` + "```python" + `
import time
from collections import defaultdict
from datetime import datetime

class MCPServerMetrics:
    def __init__(self):
        self.start_time = datetime.now()
        self.request_count = 0
        self.error_count = 0
        self.tool_calls = defaultdict(int)
        
    def record_request(self, method: str, duration: float, success: bool):
        self.request_count += 1
        
        if not success:
            self.error_count += 1
            
        if method.startswith('tools/call'):
            tool_name = method.split('/')[-1]
            self.tool_calls[tool_name] += 1
    
    def get_metrics(self):
        uptime = datetime.now() - self.start_time
        error_rate = (self.error_count / self.request_count * 100) if self.request_count > 0 else 0
        
        return {
            'uptime_seconds': uptime.total_seconds(),
            'total_requests': self.request_count,
            'error_count': self.error_count,
            'error_rate_percent': error_rate,
            'tool_usage': dict(self.tool_calls)
        }

metrics = MCPServerMetrics()

@mcp.tool()
async def get_server_metrics() -> str:
    \"\"\"Get comprehensive server metrics.\"\"\"
    
    data = metrics.get_metrics()
    
    return f\"\"\"📊 Server Metrics:
- Uptime: {data['uptime_seconds']:.0f} seconds
- Requests: {data['total_requests']} (errors: {data['error_count']})
- Error Rate: {data['error_rate_percent']:.1f}%
- Tool Usage: {data['tool_usage']}
\"\"\"
` + "```" + `

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
` + "```yaml" + `
name: Deploy MCP Server

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          pip install uv
          uv sync
        
      - name: Run tests
        run: uv run pytest
        
      - name: Test with MCP Inspector
        run: |
          timeout 30s npx @modelcontextprotocol/inspector uv run python src/server.py &
          sleep 5
          curl -f http://localhost:3000/health || exit 1

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: echo "Deploying to production..."
` + "```" + `

### Production Deployment Script
` + "```bash" + `
#!/bin/bash
# deploy.sh - Production deployment script

set -e

echo "🚀 Deploying MCP Server to Production"

IMAGE_TAG=\${1:-latest}
DEPLOYMENT_ENV=\${2:-production}

echo "📋 Deployment Configuration:"
echo "- Image Tag: $IMAGE_TAG"
echo "- Environment: $DEPLOYMENT_ENV"

# Pre-deployment checks
echo "🔍 Pre-deployment checks..."

if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot access Kubernetes cluster"
    exit 1
fi

# Deploy
echo "🚀 Deploying..."
kubectl apply -f k8s/

# Wait for deployment
echo "⏳ Waiting for deployment..."
kubectl rollout status deployment/mcp-server

echo "🎉 Deployment completed successfully!"
` + "```" + `

## 📋 Production Deployment Checklist

### ✅ Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Security scan completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Secrets management configured

### ✅ Deployment Configuration
- [ ] Environment variables configured
- [ ] Resource limits set appropriately
- [ ] Health checks implemented
- [ ] Logging properly configured
- [ ] Monitoring enabled

### ✅ Security Hardening
- [ ] Authentication/authorization implemented
- [ ] Rate limiting configured
- [ ] Input validation comprehensive
- [ ] HTTPS/TLS configured
- [ ] Secrets stored securely

### ✅ Monitoring & Observability
- [ ] Metrics collection enabled
- [ ] Alerting configured
- [ ] Log aggregation set up
- [ ] Health checks working
- [ ] Performance monitoring active

## 💡 Best Practices

1. **Blue-Green Deployment**: Deploy to parallel environment, then switch traffic
2. **Canary Releases**: Gradually roll out to subset of users
3. **Feature Flags**: Control feature availability without redeployment
4. **Graceful Shutdown**: Handle termination signals properly
5. **Circuit Breakers**: Fail fast when dependencies are down

## Next Steps

1. **Choose your deployment target** from the options above
2. **Implement monitoring and logging** using the provided examples
3. **Set up CI/CD pipeline** for automated deployments
4. **Configure security** based on your requirements
5. **Test thoroughly** before production deployment

Ready to deploy? Start with the configuration for your chosen target environment!`;
}