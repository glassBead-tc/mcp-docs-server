/**
 * Server development workflow guide
 */

export async function serverDevelopmentWorkflow(args: {
  server_type?: string;
  language?: string;
} = {}): Promise<string> {
  const { server_type = "mixed", language = "python" } = args;
  
  return `# 🏗️ MCP Server Development Workflow

## 🎯 Building a ${server_type} server in ${language}

This workflow will guide you through the complete process of developing, testing, and deploying an MCP server.

## Phase 1: Project Setup

### Environment Setup
\`\`\`bash
# Create project directory
mkdir my-mcp-${server_type}-server
cd my-mcp-${server_type}-server

${language === "python" ? `
# Python setup with uv
uv init .
uv add "mcp[cli]"
uv add httpx  # for API calls
uv add pydantic  # for data validation
` : `
# Node.js setup
npm init -y
npm install @modelcontextprotocol/sdk
npm install zod  # for schema validation
npm install --save-dev typescript @types/node tsx
`}

# Create basic structure
mkdir -p src/{tools,resources,prompts}
mkdir -p tests
mkdir -p docs
\`\`\`

### Project Configuration
${language === "python" ? `
**pyproject.toml**:
\`\`\`toml
[project]
name = "my-mcp-server"
version = "0.1.0"
description = "My MCP Server"
requires-python = ">=3.10"
dependencies = [
    "mcp>=1.2.0",
    "httpx>=0.25.0",
    "pydantic>=2.0.0"
]

[project.scripts]
server = "my_mcp_server.main:main"
\`\`\`
` : `
**tsconfig.json**:
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
\`\`\`
`}

## Phase 2: Core Server Implementation

### Server Foundation
${language === "python" ? `
**src/server.py**:
\`\`\`python
#!/usr/bin/env python3
"""
${server_type.charAt(0).toUpperCase() + server_type.slice(1)} MCP Server
"""

import asyncio
import logging
from mcp.server.fastmcp import FastMCP
from typing import Optional, Dict, Any

# Configure logging (stderr only for STDIO)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Initialize server
mcp = FastMCP("${server_type}-server")

# Server state
server_state = {
    "started_at": None,
    "request_count": 0,
    "tools_called": {},
    "resources_accessed": {}
}

def track_request(operation_type: str, operation_name: str):
    """Track server usage."""
    server_state["request_count"] += 1
    if operation_type == "tool":
        server_state["tools_called"][operation_name] = \
            server_state["tools_called"].get(operation_name, 0) + 1
    elif operation_type == "resource":
        server_state["resources_accessed"][operation_name] = \
            server_state["resources_accessed"].get(operation_name, 0) + 1

${server_type === "tool" || server_type === "mixed" ? `
# Example tools
@mcp.tool()
async def server_info() -> str:
    """Get information about this MCP server."""
    track_request("tool", "server_info")
    
    import platform
    import psutil
    from datetime import datetime
    
    uptime = datetime.now() - server_state["started_at"] if server_state["started_at"] else "Unknown"
    
    return f"""
📊 Server Information:
- Server Type: ${server_type}
- Language: Python {platform.python_version()}
- Platform: {platform.system()} {platform.release()}
- Memory Usage: {psutil.virtual_memory().percent:.1f}%
- Requests Served: {server_state["request_count"]}
- Uptime: {uptime}
"""

@mcp.tool()
async def echo_message(message: str, uppercase: bool = False) -> str:
    """Echo a message back, optionally in uppercase.
    
    Args:
        message: The message to echo
        uppercase: Whether to convert to uppercase
    """
    track_request("tool", "echo_message")
    
    if not message:
        return "Error: Message cannot be empty"
    
    result = message.upper() if uppercase else message
    return f"Echo: {result}"
` : ""}

${server_type === "resource" || server_type === "mixed" ? `
# Example resources
@mcp.resource("server://status")
async def get_server_status():
    """Current server status and metrics."""
    track_request("resource", "status")
    
    import json
    return json.dumps({
        "status": "running",
        "requests_served": server_state["request_count"],
        "tools_called": server_state["tools_called"],
        "resources_accessed": server_state["resources_accessed"]
    }, indent=2)

@mcp.resource("docs://example")
async def get_example_docs():
    """Example documentation resource."""
    track_request("resource", "example_docs")
    
    return """
# Example Documentation

This is an example resource that demonstrates how to provide
documentation and context to AI applications through MCP.

## Features
- Rich markdown content
- Dynamic data
- Contextual information

## Usage
This resource can be referenced by AI applications to provide
context for conversations and decision making.
"""
` : ""}

${server_type === "prompt" || server_type === "mixed" ? `
# Example prompts
@mcp.prompt()
async def helpful_assistant(domain: str = "general") -> str:
    """Get a helpful assistant prompt for a specific domain.
    
    Args:
        domain: The domain of expertise (general, coding, writing, analysis)
    """
    prompts = {
        "general": "You are a helpful and knowledgeable assistant. Provide clear, accurate, and useful responses.",
        "coding": "You are an expert programmer. Help with code review, debugging, and best practices. Always explain your reasoning.",
        "writing": "You are a skilled writer and editor. Help improve clarity, structure, and style while maintaining the author's voice.",
        "analysis": "You are a data analyst. Help interpret data, identify patterns, and provide actionable insights."
    }
    
    return prompts.get(domain, prompts["general"])
` : ""}

async def main():
    """Main server entry point."""
    from datetime import datetime
    
    server_state["started_at"] = datetime.now()
    logger.info(f"Starting ${server_type} MCP server...")
    
    try:
        mcp.run(transport="stdio")
    except KeyboardInterrupt:
        logger.info("Server shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise

if __name__ == "__main__":
    main()
\`\`\`
` : `
**src/server.ts**:
\`\`\`typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "${server_type}-server",
  version: "1.0.0"
}, {
  capabilities: {
    ${server_type === "tool" || server_type === "mixed" ? "tools: {}," : ""}
    ${server_type === "resource" || server_type === "mixed" ? "resources: {}," : ""}
    ${server_type === "prompt" || server_type === "mixed" ? "prompts: {}" : ""}
  }
});

// Server state
const serverState = {
  startedAt: new Date(),
  requestCount: 0,
  toolsCalled: {} as Record<string, number>,
  resourcesAccessed: {} as Record<string, number>
};

function trackRequest(operationType: string, operationName: string) {
  serverState.requestCount++;
  if (operationType === "tool") {
    serverState.toolsCalled[operationName] = (serverState.toolsCalled[operationName] || 0) + 1;
  } else if (operationType === "resource") {
    serverState.resourcesAccessed[operationName] = (serverState.resourcesAccessed[operationName] || 0) + 1;
  }
}

${server_type === "tool" || server_type === "mixed" ? `
// Tools implementation
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "server_info",
        description: "Get information about this MCP server",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "echo_message",
        description: "Echo a message back, optionally in uppercase",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message to echo"
            },
            uppercase: {
              type: "boolean",
              description: "Whether to convert to uppercase",
              default: false
            }
          },
          required: ["message"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "server_info":
      trackRequest("tool", "server_info");
      const uptime = Date.now() - serverState.startedAt.getTime();
      
      return {
        content: [{
          type: "text",
          text: \`📊 Server Information:
- Server Type: ${server_type}
- Language: TypeScript/Node.js
- Requests Served: \${serverState.requestCount}
- Uptime: \${Math.floor(uptime / 1000)}s
- Tools Called: \${JSON.stringify(serverState.toolsCalled, null, 2)}
\`
        }]
      };
      
    case "echo_message":
      trackRequest("tool", "echo_message");
      const message = args.message as string;
      const uppercase = args.uppercase as boolean;
      
      if (!message) {
        return {
          content: [{
            type: "text",
            text: "Error: Message cannot be empty"
          }],
          isError: true
        };
      }
      
      const result = uppercase ? message.toUpperCase() : message;
      return {
        content: [{
          type: "text",
          text: \`Echo: \${result}\`
        }]
      };
      
    default:
      throw new Error(\`Unknown tool: \${name}\`);
  }
});
` : ""}

${server_type === "resource" || server_type === "mixed" ? `
// Resources implementation
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "server://status",
        name: "Server Status",
        description: "Current server status and metrics",
        mimeType: "application/json"
      },
      {
        uri: "docs://example",
        name: "Example Documentation",
        description: "Example resource documentation",
        mimeType: "text/markdown"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  trackRequest("resource", uri);
  
  switch (uri) {
    case "server://status":
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            status: "running",
            requestsServed: serverState.requestCount,
            toolsCalled: serverState.toolsCalled,
            resourcesAccessed: serverState.resourcesAccessed,
            uptime: Date.now() - serverState.startedAt.getTime()
          }, null, 2)
        }]
      };
      
    case "docs://example":
      return {
        contents: [{
          uri,
          mimeType: "text/markdown",
          text: \`# Example Documentation

This is an example resource that demonstrates how to provide
documentation and context to AI applications through MCP.

## Server Information
- Type: ${server_type}
- Language: TypeScript
- Started: \${serverState.startedAt.toISOString()}

## Features
- Rich markdown content
- Dynamic data
- Contextual information

## Usage
This resource can be referenced by AI applications to provide
context for conversations and decision making.
\`
        }]
      };
      
    default:
      throw new Error(\`Resource not found: \${uri}\`);
  }
});
` : ""}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("${server_type.charAt(0).toUpperCase() + server_type.slice(1)} MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server failed:", error);
  process.exit(1);
});
\`\`\`
`}

## Phase 3: Testing Strategy

### Local Testing with MCP Inspector
\`\`\`bash
# Test your server interactively
${language === "python" ? "npx @modelcontextprotocol/inspector python src/server.py" : "npx @modelcontextprotocol/inspector node build/server.js"}

# Expected output:
# - Server should connect successfully
# - Tools should be listed correctly
# - Tool calls should work
# - Resources should be accessible
\`\`\`

### Automated Testing
${language === "python" ? `
**tests/test_server.py**:
\`\`\`python
import pytest
import asyncio
from mcp.client import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

@pytest.mark.asyncio
async def test_server_tools():
    """Test server tool functionality."""
    
    # Connect to server
    server_params = StdioServerParameters(
        command="python",
        args=["src/server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize
            await session.initialize()
            
            # Test tool listing
            tools = await session.list_tools()
            assert len(tools.tools) > 0
            
            # Test tool execution
            result = await session.call_tool("echo_message", {
                "message": "Hello MCP!",
                "uppercase": True
            })
            
            assert result.content[0].text == "Echo: HELLO MCP!"

@pytest.mark.asyncio 
async def test_server_resources():
    """Test server resource functionality."""
    
    server_params = StdioServerParameters(
        command="python", 
        args=["src/server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Test resource listing
            resources = await session.list_resources()
            assert len(resources.resources) > 0
            
            # Test resource reading
            content = await session.read_resource("server://status")
            assert len(content.contents) > 0
            assert "status" in content.contents[0].text

if __name__ == "__main__":
    pytest.main([__file__])
\`\`\`
` : `
**tests/server.test.ts**:
\`\`\`typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

describe('MCP Server Tests', () => {
  let client: Client;
  let transport: StdioClientTransport;
  
  beforeEach(async () => {
    transport = new StdioClientTransport({
      command: "node",
      args: ["build/server.js"]
    });
    
    client = new Client({
      name: "test-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });
    
    await client.connect(transport);
  });
  
  afterEach(async () => {
    await client.close();
  });
  
  it('should list tools correctly', async () => {
    const tools = await client.listTools();
    expect(tools.tools.length).toBeGreaterThan(0);
    expect(tools.tools[0]).toHaveProperty('name');
    expect(tools.tools[0]).toHaveProperty('description');
  });
  
  it('should execute tools successfully', async () => {
    const result = await client.callTool({
      name: "echo_message",
      arguments: {
        message: "Hello MCP!",
        uppercase: true
      }
    });
    
    expect(result.content[0].text).toBe("Echo: HELLO MCP!");
  });
  
  it('should provide resources', async () => {
    const resources = await client.listResources();
    expect(resources.resources.length).toBeGreaterThan(0);
    
    const content = await client.readResource({
      uri: "server://status"
    });
    
    expect(content.contents.length).toBeGreaterThan(0);
    expect(content.contents[0].text).toContain("status");
  });
});
\`\`\`
`}

### Integration Testing with Claude Desktop
1. **Add to Claude Desktop config**:
\`\`\`json
{
  "mcpServers": {
    "my-${server_type}-server": {
      "command": "${language === "python" ? "python" : "node"}",
      "args": ["${language === "python" ? "src/server.py" : "build/server.js"}"],
      "env": {
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
\`\`\`

2. **Test with Claude Desktop**:
   - Restart Claude Desktop
   - Look for MCP tools indicator
   - Test each tool/resource/prompt
   - Verify expected behavior

## Phase 4: Error Handling & Validation

### Input Validation
${language === "python" ? `
\`\`\`python
from pydantic import BaseModel, ValidationError, validator

class ToolInput(BaseModel):
    message: str
    max_length: int = 1000
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()
    
    @validator('max_length')
    def reasonable_length(cls, v):
        if v < 1 or v > 10000:
            raise ValueError('Length must be between 1 and 10000')
        return v

@mcp.tool()
async def validated_tool(**kwargs) -> str:
    """Tool with comprehensive input validation."""
    try:
        # Validate input
        params = ToolInput(**kwargs)
        
        # Process with validated params
        result = process_message(params.message, params.max_length)
        return f"Processed: {result}"
        
    except ValidationError as e:
        return f"Validation error: {e}"
    except Exception as e:
        return f"Processing error: {e}"
\`\`\`
` : `
\`\`\`typescript
import { z } from "zod";

const toolInputSchema = z.object({
  message: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
  maxLength: z.number()
    .min(1)
    .max(10000)
    .default(1000)
});

// In tool handler
try {
  const params = toolInputSchema.parse(args);
  const result = processMessage(params.message, params.maxLength);
  return {
    content: [{
      type: "text",
      text: \`Processed: \${result}\`
    }]
  };
} catch (error) {
  if (error instanceof z.ZodError) {
    return {
      content: [{
        type: "text", 
        text: \`Validation error: \${error.errors.map(e => e.message).join(", ")}\`
      }],
      isError: true
    };
  }
  throw error;
}
\`\`\`
`}

### Comprehensive Error Handling
\`\`\`${language}
${language === "python" ? `
import logging
from enum import Enum

class ErrorType(Enum):
    VALIDATION = "validation_error"
    PERMISSION = "permission_error"
    EXTERNAL_API = "external_api_error"
    SYSTEM = "system_error"

class MCPError(Exception):
    def __init__(self, error_type: ErrorType, message: str, details: dict = None):
        self.error_type = error_type
        self.message = message
        self.details = details or {}
        super().__init__(message)

@mcp.tool()
async def robust_tool(param: str) -> str:
    """Tool with comprehensive error handling."""
    
    try:
        # Validate input
        if not param:
            raise MCPError(ErrorType.VALIDATION, "Parameter required")
        
        # Process with error handling
        result = await external_api_call(param)
        return f"Success: {result}"
        
    except MCPError as e:
        logger.error(f"MCP Error: {e.error_type.value} - {e.message}")
        return f"Error: {e.message}"
        
    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        return f"System error: {e}"
` : `
enum ErrorType {
  VALIDATION = "validation_error",
  PERMISSION = "permission_error", 
  EXTERNAL_API = "external_api_error",
  SYSTEM = "system_error"
}

class MCPError extends Error {
  constructor(
    public errorType: ErrorType,
    message: string,
    public details: Record<string, any> = {}
  ) {
    super(message);
    this.name = "MCPError";
  }
}

// In tool handler
try {
  if (!args.param) {
    throw new MCPError(ErrorType.VALIDATION, "Parameter required");
  }
  
  const result = await externalApiCall(args.param);
  return {
    content: [{
      type: "text",
      text: \`Success: \${result}\`
    }]
  };
  
} catch (error) {
  if (error instanceof MCPError) {
    console.error(\`MCP Error: \${error.errorType} - \${error.message}\`);
    return {
      content: [{
        type: "text",
        text: \`Error: \${error.message}\`
      }],
      isError: true
    };
  }
  
  console.error(\`Unexpected error:\`, error);
  return {
    content: [{
      type: "text",
      text: \`System error: \${error}\`
    }],
    isError: true
  };
}
`}
\`\`\`

## Phase 5: Production Readiness

### Configuration Management
${language === "python" ? `
\`\`\`python
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class ServerConfig:
    # Server settings
    name: str = "my-mcp-server"
    version: str = "1.0.0"
    
    # Performance
    max_concurrent_requests: int = 10
    request_timeout: float = 30.0
    
    # Security
    api_key: Optional[str] = None
    rate_limit_per_minute: int = 100
    
    # External services
    database_url: Optional[str] = None
    api_base_url: str = "https://api.example.com"
    
    @classmethod
    def from_env(cls) -> "ServerConfig":
        """Load configuration from environment variables."""
        return cls(
            name=os.getenv("SERVER_NAME", "my-mcp-server"),
            version=os.getenv("SERVER_VERSION", "1.0.0"),
            max_concurrent_requests=int(os.getenv("MAX_REQUESTS", "10")),
            request_timeout=float(os.getenv("REQUEST_TIMEOUT", "30.0")),
            api_key=os.getenv("API_KEY"),
            rate_limit_per_minute=int(os.getenv("RATE_LIMIT", "100")),
            database_url=os.getenv("DATABASE_URL"),
            api_base_url=os.getenv("API_BASE_URL", "https://api.example.com")
        )

# Use in server
config = ServerConfig.from_env()
mcp = FastMCP(config.name)
\`\`\`
` : `
\`\`\`typescript
interface ServerConfig {
  name: string;
  version: string;
  maxConcurrentRequests: number;
  requestTimeout: number;
  apiKey?: string;
  rateLimitPerMinute: number;
  databaseUrl?: string;
  apiBaseUrl: string;
}

function loadConfig(): ServerConfig {
  return {
    name: process.env.SERVER_NAME || "my-mcp-server",
    version: process.env.SERVER_VERSION || "1.0.0",
    maxConcurrentRequests: parseInt(process.env.MAX_REQUESTS || "10"),
    requestTimeout: parseFloat(process.env.REQUEST_TIMEOUT || "30.0"),
    apiKey: process.env.API_KEY,
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT || "100"),
    databaseUrl: process.env.DATABASE_URL,
    apiBaseUrl: process.env.API_BASE_URL || "https://api.example.com"
  };
}

const config = loadConfig();
\`\`\`
`}

### Health Monitoring
\`\`\`${language}
${language === "python" ? `
@mcp.tool()
async def health_check() -> str:
    """Comprehensive health check."""
    
    import psutil
    from datetime import datetime
    
    # System metrics
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Application metrics
    uptime = datetime.now() - server_state["started_at"]
    error_rate = 0  # Calculate from your error tracking
    
    status = "healthy"
    if memory.percent > 90 or disk.percent > 95:
        status = "degraded"
    if memory.percent > 95 or error_rate > 10:
        status = "unhealthy"
    
    return f"""
🏥 Health Check Results:

Status: {status.upper()}
Uptime: {uptime}
Requests: {server_state["request_count"]}

System:
- Memory: {memory.percent:.1f}%
- Disk: {disk.percent:.1f}%
- CPU: {psutil.cpu_percent():.1f}%

Application:
- Active connections: {len(active_connections)}
- Error rate: {error_rate:.1f}%
"""
` : `
// Add to tool handlers
case "health_check":
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  const healthStatus = {
    status: "healthy",
    uptime: \`\${Math.floor(uptime)}s\`,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024)
    },
    requests: serverState.requestCount
  };
  
  return {
    content: [{
      type: "text",
      text: \`🏥 Health Check:
Status: \${healthStatus.status.toUpperCase()}
Uptime: \${healthStatus.uptime}
Memory: \${healthStatus.memory.used}MB / \${healthStatus.memory.total}MB
Requests: \${healthStatus.requests}
\`
    }]
  };
`}
\`\`\`

## Phase 6: Deployment

### Local Deployment
\`\`\`bash
# Build for production
${language === "python" ? `
# Create distribution
uv build

# Install globally
uv tool install .
` : `
# Compile TypeScript
npm run build

# Test production build
node build/server.js
`}

# Test connection
npx @modelcontextprotocol/inspector ${language === "python" ? "my-mcp-server" : "node build/server.js"}
\`\`\`

### Container Deployment
\`\`\`dockerfile
FROM ${language === "python" ? "python:3.11-slim" : "node:18-alpine"}

${language === "python" ? `
# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy project
WORKDIR /app
COPY . .

# Install dependencies
RUN uv sync --frozen

# Run server
CMD ["uv", "run", "python", "src/server.py"]
` : `
# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy and build
COPY . .
RUN npm run build

# Run server
CMD ["node", "build/server.js"]
`}
\`\`\`

### Remote Deployment (HTTP)
${language === "python" ? `
\`\`\`python
# For HTTP transport
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI

app = FastAPI()
mcp = FastMCP("remote-server")

# Add your tools/resources/prompts here

# Mount MCP on FastAPI
app.mount("/mcp", mcp.create_fastapi_app())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`
` : `
\`\`\`typescript
// HTTP server setup
import express from 'express';
import { createMCPServer } from './server.js';

const app = express();
app.use('/mcp', createMCPServer());

app.listen(3000, () => {
  console.log('MCP Server running on http://localhost:3000/mcp');
});
\`\`\`
`}

## 🎯 Development Checklist

### ✅ Pre-Development
- [ ] Environment set up correctly
- [ ] MCP SDK installed
- [ ] Project structure created
- [ ] Configuration planned

### ✅ Core Implementation  
- [ ] Server foundation implemented
- [ ] ${server_type === "tool" || server_type === "mixed" ? "Tools defined and working" : ""}
- [ ] ${server_type === "resource" || server_type === "mixed" ? "Resources accessible" : ""}
- [ ] ${server_type === "prompt" || server_type === "mixed" ? "Prompts created" : ""}
- [ ] Error handling implemented

### ✅ Testing
- [ ] Unit tests written and passing
- [ ] MCP Inspector testing successful
- [ ] Claude Desktop integration working
- [ ] Error scenarios tested

### ✅ Production Ready
- [ ] Configuration externalized
- [ ] Logging implemented properly
- [ ] Health checks added
- [ ] Security review completed
- [ ] Documentation written

## 💡 Pro Tips

1. **Start Simple**: Begin with one tool, then expand
2. **Test Early**: Use MCP Inspector from the beginning
3. **Document Everything**: Good descriptions improve AI interaction
4. **Handle Errors Gracefully**: AI applications need reliable feedback
5. **Monitor Performance**: Track tool usage and response times

## Next Steps

1. **Implement your server** using the template above
2. **Test thoroughly** with both Inspector and Claude Desktop  
3. **Add error handling** and validation
4. **Deploy** using your preferred method
5. **Monitor** and iterate based on usage

Ready to start building? Choose your first tool and begin with the template above!`;
}