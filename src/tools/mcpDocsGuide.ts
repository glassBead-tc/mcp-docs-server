import { z } from "zod";

/**
 * MCP Documentation Guide Tool
 * 
 * Provides comprehensive guides and documentation for Model Context Protocol development.
 * Similar to websetsGuide but focused on MCP concepts, development, and best practices.
 */

const inputSchema = z.object({
  topic: z.enum([
    "getting_started",
    "building_servers", 
    "building_clients",
    "core_concepts",
    "tools_and_resources",
    "protocol_specification",
    "troubleshooting",
    "best_practices",
    "examples_and_tutorials"
  ]).describe("The documentation topic you'd like guidance on")
});

export const mcpDocsGuide = {
  name: "mcp_docs_guide",
  description: "Get comprehensive guides and documentation for Model Context Protocol development. Covers getting started, building servers/clients, core concepts, and best practices.",
  inputSchema: inputSchema.shape,
  
  async execute(args: z.infer<typeof inputSchema>) {
    const { topic } = args;
    
    const guides = {
      getting_started: {
        title: "Getting Started with Model Context Protocol",
        content: `
**Welcome to Model Context Protocol (MCP)!**

MCP is an open-source standard for connecting AI applications to external systems.

**Think of MCP like USB-C for AI** - it provides a standardized way to connect AI applications to data sources, tools, and workflows.

## What can MCP enable?

• **Personalized AI assistants** that access your Google Calendar and Notion
• **Code generation** using Figma designs to create web apps  
• **Enterprise chatbots** that connect to multiple databases
• **Creative workflows** where AI controls 3D printers and design tools

## Core Architecture

MCP follows a **client-server architecture**:

**MCP Host** → **MCP Client** → **MCP Server**

- **Host**: The AI application (like Claude Desktop)
- **Client**: Component that connects to servers
- **Server**: Program that provides context and capabilities

## The Three Core Primitives

### 1. 🔧 Tools (Model-Controlled)
Functions that AI models can execute:
- Database queries, API calls, calculations
- The LLM decides when to use them

### 2. 📄 Resources (Application-Controlled)  
Data sources that provide context:
- File contents, database records, API responses
- The client manages what to attach

### 3. 💬 Prompts (User-Controlled)
Templates for structuring interactions:
- System prompts, few-shot examples
- Users invoke through interface

## Quick Start Steps

1. **Choose your development path:**
   - Build an MCP server to expose your data/tools
   - Build an MCP client to connect to servers
   - Use existing servers with existing clients

2. **Start with a simple tool:**
   - Create a basic server with one tool
   - Test with MCP Inspector
   - Connect to Claude Desktop

3. **Expand gradually:**
   - Add more tools and resources
   - Implement proper error handling
   - Deploy for production use

## Next Steps

- **New to development?** → Use "building_servers" guide
- **Want architecture details?** → Explore "core_concepts"
- **Ready to build?** → See "examples_and_tutorials"
        `
      },

      building_servers: {
        title: "Building MCP Servers",
        content: `
**Building MCP Servers**

MCP servers provide context and capabilities to AI applications through tools, resources, and prompts.

## Basic Server Structure

### Python Server (Recommended)
Use FastMCP for the simplest setup:

` + "```python" + `
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
async def get_weather(location: str) -> str:
    """Get weather for a location."""
    return f"Weather in {location}: Sunny, 72°F"

if __name__ == "__main__":
    mcp.run(transport="stdio")
` + "```" + `

### TypeScript Server
` + "```typescript" + `
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

// Add tool handlers and start server
` + "```" + `

## Core Implementation Patterns

### Tools Implementation
- Define clear, single-purpose functions
- Include comprehensive descriptions
- Implement proper input validation
- Handle errors gracefully

### Resources Implementation  
- Use meaningful URI schemes
- Provide rich metadata
- Support dynamic resource lists
- Handle file permissions properly

### Prompts Implementation
- Create reusable templates
- Support parameterization
- Include helpful examples
- Guide AI interactions effectively

## Testing Your Server

### With MCP Inspector
` + "```bash" + `
npx @modelcontextprotocol/inspector python server.py
` + "```" + `

### With Claude Desktop
1. Add server to configuration
2. Restart Claude Desktop
3. Test tools appear and work correctly

## Best Practices

- **Start simple**: One tool, then expand
- **Validate inputs**: Always check parameters
- **Handle errors**: Provide clear error messages
- **Document well**: Good descriptions improve AI interaction
- **Test thoroughly**: Use both Inspector and real clients

## Next Steps

- **Need examples?** → Check "examples_and_tutorials"
- **Want advanced patterns?** → See "best_practices"
- **Ready to deploy?** → Use "deployment_guide"
        `
      },

      building_clients: {
        title: "Building MCP Clients",
        content: `
**Building MCP Clients**

MCP clients connect to servers and integrate their capabilities into AI applications.

## Basic Client Structure

### TypeScript Client
` + "```typescript" + `
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "python",
  args: ["server.py"]
});

const client = new Client({
  name: "my-client",
  version: "1.0.0"
}, {
  capabilities: { sampling: {} }
});

await client.connect(transport);
await client.initialize();
` + "```" + `

## Core Operations

### Discovery
` + "```typescript" + `
// Discover server capabilities
const tools = await client.listTools();
const resources = await client.listResources();
const prompts = await client.listPrompts();
` + "```" + `

### Execution
` + "```typescript" + `
// Execute a tool
const result = await client.callTool({
  name: "get_weather",
  arguments: { location: "San Francisco" }
});

// Read a resource
const content = await client.readResource({
  uri: "file:///path/to/file.txt"
});
` + "```" + `

## Integration Patterns

### Multi-Server Management
- Connect to multiple servers simultaneously
- Route requests to appropriate servers
- Handle connection failures gracefully
- Manage server lifecycles

### LLM Integration
- Present tools to language models
- Execute tool calls from LLM
- Provide context through resources
- Guide interactions with prompts

### User Experience
- Show available capabilities clearly
- Provide confirmation for destructive actions
- Display results in user-friendly format
- Handle errors gracefully

## Next Steps

- **Want implementation details?** → See "examples_and_tutorials"
- **Need integration help?** → Use client_integration_guide()
- **Ready for production?** → Check "best_practices"
        `
      },

      core_concepts: {
        title: "MCP Core Concepts",
        content: `
**Model Context Protocol Core Concepts**

## Architecture Overview

MCP follows a **client-server architecture** with clear separation of concerns.

### Key Participants

1. **MCP Host**: The AI application that coordinates everything
2. **MCP Client**: Component that maintains server connections  
3. **MCP Server**: Program that provides context and capabilities

### Protocol Layers

#### Transport Layer
- **STDIO**: Best for local processes (no network overhead)
- **HTTP**: Best for remote servers (standard web protocols)

#### Data Layer  
- **JSON-RPC 2.0**: Message format and protocol
- **Lifecycle management**: Connection and capability negotiation
- **Core primitives**: Tools, resources, and prompts

## The Three Core Primitives

### 🔧 Tools (Model-Controlled)
Functions that AI models can execute:

**Characteristics:**
- Model decides when to use them
- Can modify external state
- Require user approval for safety
- Have defined input/output schemas

**Examples:** Database queries, file operations, API calls

### 📄 Resources (Application-Controlled)
Data sources that provide contextual information:

**Characteristics:**
- Application decides what to attach
- Read-only access to data
- Can be static or dynamic
- Support various content types

**Examples:** File contents, database records, documentation

### 💬 Prompts (User-Controlled)
Templates that structure interactions:

**Characteristics:**
- Users decide when to invoke
- Provide structured guidance
- Can include examples and context
- Support parameterization

**Examples:** System prompts, workflow templates, role definitions

## Control Hierarchy

| Primitive | Who Controls | When Used | Purpose |
|-----------|-------------|-----------|---------|
| **Tools** | 🤖 Model | LLM decides | Take actions |
| **Resources** | 🖥️ Application | Client attaches | Provide context |
| **Prompts** | 👤 User | User invokes | Guide interactions |

## Lifecycle Management

### 1. Connection Establishment
Client and server establish connection and negotiate capabilities

### 2. Capability Negotiation
Both parties declare what features they support

### 3. Ready State
Connection is ready for operational requests

### 4. Operational Phase
Tools are executed, resources are read, prompts are used

## Discovery and Execution

### Pattern: Discovery → Execution
1. **List** available primitives (tools/list, resources/list)
2. **Execute** operations (tools/call, resources/read)
3. **Handle** responses and errors

### Content Types and Formats
- **Text content**: Plain text and markdown
- **Image content**: Base64-encoded images
- **Resource references**: Links to other resources
- **Structured content**: JSON data with schemas

## Security Model

### Trust Boundaries
- Servers are untrusted by default
- User approval required for state changes
- Principle of least privilege applies

### Best Practices
- Input validation and sanitization
- Explicit user consent flows
- Proper access controls
- Comprehensive audit logging

## Next Steps

- **Want to build?** → See "building_servers" or "building_clients"
- **Need examples?** → Check "examples_and_tutorials"
- **Dive deeper?** → Explore "protocol_specification"
        `
      },

      tools_and_resources: {
        title: "Tools and Resources Deep Dive",
        content: `
**Tools and Resources Deep Dive**

## Tools: Model-Controlled Actions

### Tool Design Principles

**1. Clear Purpose**
Each tool should have a single, well-defined responsibility.

**2. Robust Input Validation**
Always validate and sanitize inputs before processing.

**3. Descriptive Schemas**
Provide comprehensive JSON schemas with examples and descriptions.

### Tool Implementation Patterns

#### Basic Tool Structure
` + "```python" + `
@mcp.tool()
async def search_database(query: str, limit: int = 10) -> str:
    \"\"\"Search database with the given query.
    
    Args:
        query: Search query string (required)
        limit: Maximum results (1-100, default: 10)
    \"\"\"
    
    # Validate inputs
    if not query or len(query.strip()) == 0:
        raise ValueError("Query cannot be empty")
    
    if limit < 1 or limit > 100:
        raise ValueError("Limit must be between 1 and 100")
    
    # Execute safely
    results = database.search(query, limit)
    return format_results(results)
` + "```" + `

#### Error Handling
` + "```python" + `
@mcp.tool()
async def safe_operation(data: str) -> str:
    \"\"\"Operation with comprehensive error handling.\"\"\"
    
    try:
        # Validate input
        if not data:
            return "Error: Data parameter is required"
        
        # Process safely
        result = process_data(data)
        return f"Success: {result}"
        
    except ValueError as e:
        return f"Input error: {e}"
    except Exception as e:
        return f"Processing error: {e}"
` + "```" + `

### Tool Result Formats

#### Text Results
Return simple text for basic responses.

#### Structured Results
Return both text and structured data for programmatic use.

#### Multi-Content Results
Combine text, images, and resource references.

## Resources: Application-Controlled Context

### Resource Design Principles

**1. URI-Based Identification**
Use meaningful URI schemes:
- file:///path/to/document.pdf
- db://localhost/users/table/customers  
- api://github.com/repos/owner/repo

**2. Rich Metadata**
Include audience, priority, and modification time information.

**3. Dynamic Resource Lists**
Support resources that change over time.

### Resource Implementation Patterns

#### File System Resources
` + "```python" + `
@mcp.resource("file://{path}")
async def read_file(path: str):
    \"\"\"Read file with validation and metadata.\"\"\"
    
    # Validate path
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    
    # Read with metadata
    stat = os.stat(path)
    content = open(path).read()
    
    return {
        "uri": f"file://{path}",
        "name": os.path.basename(path),
        "mimeType": guess_mime_type(path),
        "text": content,
        "annotations": {
            "lastModified": datetime.fromtimestamp(stat.st_mtime).isoformat()
        }
    }
` + "```" + `

#### Dynamic Resources
` + "```python" + `
@mcp.resource("stats://project/summary")
async def project_summary():
    \"\"\"Generate project statistics on demand.\"\"\"
    
    file_count = len(glob.glob("**/*.py", recursive=True))
    line_count = sum(count_lines(f) for f in glob.glob("**/*.py"))
    
    return {
        "uri": "stats://project/summary",
        "name": "Project Summary",
        "text": f"Files: {file_count}, Lines: {line_count}",
        "mimeType": "text/plain"
    }
` + "```" + `

## Integration Patterns

### Tools + Resources
Tools can create or reference resources in their responses.

### Progressive Disclosure
Start with simple operations, provide detailed information on demand.

### Caching and Performance
- Cache expensive operations
- Use async patterns properly
- Implement reasonable timeouts
- Monitor resource usage

## Next Steps

- **Want implementation details?** → See "building_servers"
- **Need protocol specifics?** → Check "protocol_specification"  
- **Ready for examples?** → Explore "examples_and_tutorials"
        `
      },

      protocol_specification: {
        title: "Protocol Specification Reference",
        content: `
**MCP Protocol Specification Reference**

## Protocol Overview

MCP uses **JSON-RPC 2.0** as its foundation with specific extensions for AI applications.

**Current Version**: 2025-06-18

## Base Protocol Requirements

### Message Format
All messages MUST follow JSON-RPC 2.0:

` + "```json" + `
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "method_name",
  "params": {
    "parameter": "value"
  }
}
` + "```" + `

### Key Requirements
1. **ID Requirements**: Request IDs MUST NOT be null
2. **ID Uniqueness**: IDs MUST NOT be reused within a session
3. **No Batching**: Batch requests are NOT supported

## Transport Specifications

### STDIO Transport
- Uses standard input/output streams
- Best for local servers and desktop applications
- Binary-safe message framing
- No network overhead

### HTTP Transport
- Uses HTTP POST for client-to-server requests
- Optional Server-Sent Events for server-to-client
- Standard HTTP authentication
- Required MCP-Protocol-Version header

## Core Primitive Protocols

### Tools Protocol
- **tools/list**: Discover available tools
- **tools/call**: Execute a tool with parameters
- **notifications/tools/list_changed**: Tool list updates

### Resources Protocol
- **resources/list**: Discover available resources
- **resources/read**: Read resource content
- **resources/subscribe**: Subscribe to resource changes
- **notifications/resources/updated**: Resource change notifications

### Prompts Protocol
- **prompts/list**: Discover available prompts
- **prompts/get**: Get prompt with arguments

## Error Handling

### Standard JSON-RPC Errors
- -32700: Parse error
- -32600: Invalid Request
- -32601: Method not found
- -32602: Invalid params
- -32603: Internal error

### MCP-Specific Errors  
- -32000: Server error
- -32001: Implementation limit exceeded
- -32002: Resource not found
- -32003: Tool execution failed

## Security Considerations

### Trust Model
- Servers are untrusted by default
- User approval required for state changes
- Principle of least privilege
- Comprehensive input validation

### Authentication
- Bearer token authentication for HTTP
- API key authentication
- OAuth 2.0 integration support

## Next Steps

- **Want implementation guidance?** → See "building_servers" or "building_clients"
- **Need examples?** → Check "examples_and_tutorials"
- **Want best practices?** → Review "best_practices"
        `
      },

      troubleshooting: {
        title: "Troubleshooting MCP Issues",
        content: `
**Troubleshooting MCP Issues**

## Common Issues and Solutions

### Connection Issues

#### Server Not Starting
**Symptoms**: Process exits immediately

**Debugging Steps:**
1. Test server directly: python server.py
2. Check syntax: python -m py_compile server.py  
3. Test with Inspector: npx @modelcontextprotocol/inspector python server.py

**Common Causes:**
- Missing dependencies
- Python path issues
- Import errors
- Environment variable problems

#### Claude Desktop Not Connecting
**Symptoms**: No MCP tools appear

**Configuration Check:**
- Use absolute paths in configuration
- Validate JSON syntax
- Restart Claude Desktop completely
- Check Claude logs in ~/Library/Logs/Claude/

### Tool Execution Issues

#### Tools Not Appearing
**Checklist:**
- Tools have proper descriptions (docstrings)
- Server declares tools capability
- Tool registration syntax is correct
- All tool modules load without errors

#### Tool Calls Failing
**Error Handling Pattern:**
- Validate all inputs immediately
- Provide clear error messages
- Log unexpected errors properly
- Return user-friendly responses

### Resource Access Issues

#### Resources Not Found
**Debugging:**
- Check URI format and validity
- Verify file permissions
- Test resource listing first
- Validate resource implementation

#### Permission Errors
**Solutions:**
- Check file/directory permissions
- Use proper path validation
- Implement access controls
- Handle permission errors gracefully

## Debugging Tools

### MCP Inspector
- Interactive testing interface
- Real-time message inspection
- Capability validation
- Error diagnosis

### Custom Debug Tools
- Create test clients for validation
- Implement health check endpoints
- Add comprehensive logging
- Monitor performance metrics

## Prevention Strategies

### Automated Testing
- Unit tests for all tools
- Integration tests with real clients
- Error scenario testing
- Performance testing

### Best Practices
- Start with minimal examples
- Test incrementally
- Follow established patterns
- Document troubleshooting steps

## Getting Help

### Community Resources
- GitHub Discussions for protocol questions
- Discord/Slack for real-time support
- Documentation for guides and examples

### Bug Reports
Include: MCP version, environment details, configuration, logs, reproduction steps

## Next Steps

- **Still having issues?** → Try "examples_and_tutorials"
- **Ready for production?** → Review "best_practices"
- **Want to contribute?** → Check community guidelines
        `
      },

      best_practices: {
        title: "MCP Development Best Practices",
        content: `
**MCP Development Best Practices**

## Server Development Best Practices

### Design Principles

#### Single Responsibility
Each tool should have one clear purpose and do it well.

#### Fail Fast with Clear Errors
Validate inputs immediately and provide helpful error messages.

#### Comprehensive Documentation
Include detailed descriptions, examples, and parameter explanations.

### Security Best Practices

#### Input Validation
- Sanitize all inputs before processing
- Use schema validation libraries
- Check parameter ranges and formats
- Prevent injection attacks

#### Access Controls
- Implement proper authentication
- Use principle of least privilege
- Validate file paths and permissions
- Rate limit requests appropriately

#### Secrets Management
- Never hardcode secrets in code
- Use environment variables
- Implement secure configuration loading
- Rotate secrets regularly

### Performance Optimization

#### Async Best Practices
- Use proper async/await patterns
- Implement connection pooling
- Limit concurrent operations
- Handle timeouts gracefully

#### Caching Strategies
- Cache expensive operations
- Implement TTL for cached data
- Use appropriate cache invalidation
- Monitor cache hit rates

#### Resource Management
- Monitor memory usage
- Implement proper cleanup
- Use streaming for large data
- Set reasonable resource limits

## Client Development Best Practices

### Connection Management

#### Robust Connection Handling
- Implement retry logic with backoff
- Handle connection failures gracefully
- Support connection pooling
- Monitor connection health

#### Multi-Server Coordination
- Route requests to appropriate servers
- Handle server availability
- Implement failover mechanisms
- Track server capabilities

### User Experience

#### Progressive Disclosure
- Categorize tools by complexity and risk
- Show appropriate confirmation prompts
- Provide clear status indicators
- Handle errors gracefully

#### Safety and Security
- Require confirmation for destructive operations
- Show tool inputs before execution
- Validate all responses
- Implement audit logging

## Testing and Quality Assurance

### Testing Strategy
- Unit tests for all components
- Integration tests with real servers
- Performance testing under load
- Security testing for vulnerabilities

### Monitoring and Observability
- Implement comprehensive logging
- Track performance metrics
- Monitor error rates
- Set up alerting for issues

## Documentation Best Practices

### Code Documentation
- Comprehensive tool descriptions
- Clear parameter explanations
- Usage examples
- Error condition documentation

### User Documentation
- Getting started guides
- API reference
- Troubleshooting guides
- Best practices documentation

## Deployment Best Practices

### Configuration Management
- Externalize all configuration
- Use environment-specific configs
- Implement secure secret storage
- Support configuration validation

### Production Readiness
- Implement health checks
- Add metrics collection
- Configure proper logging
- Set up monitoring and alerting

### Security Hardening
- Use HTTPS for remote servers
- Implement proper authentication
- Enable rate limiting
- Regular security audits

## Next Steps

- **Want to see these in action?** → Check "examples_and_tutorials"
- **Ready to deploy?** → Use "deployment_guide"  
- **Need specific guidance?** → Join the MCP community
        `
      },

      examples_and_tutorials: {
        title: "Examples and Tutorials",
        content: `
**MCP Examples and Tutorials**

## Complete Server Examples

### 1. File Management Server
A server that provides secure file operations:

` + "```python" + `
from mcp.server.fastmcp import FastMCP
from pathlib import Path

mcp = FastMCP("file-manager")

@mcp.tool()
async def list_files(directory: str = ".") -> str:
    \"\"\"List files in a directory.\"\"\"
    try:
        path = Path(directory).resolve()
        files = [f.name for f in path.iterdir() if f.is_file()]
        return f"Files in {directory}: {', '.join(files)}"
    except Exception as e:
        return f"Error: {e}"

@mcp.tool()
async def read_file(file_path: str) -> str:
    \"\"\"Read contents of a text file.\"\"\"
    try:
        path = Path(file_path)
        if path.stat().st_size > 1_000_000:  # 1MB limit
            return "Error: File too large"
        return path.read_text()
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
` + "```" + `

### 2. Database Query Server
A server that safely interfaces with databases:

` + "```python" + `
import sqlite3
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("database-server")

@mcp.tool()
async def query_database(sql_query: str) -> str:
    \"\"\"Execute a SELECT query on the database.\"\"\"
    
    # Validate query (only SELECT allowed)
    if not sql_query.strip().lower().startswith('select'):
        return "Error: Only SELECT queries allowed"
    
    try:
        conn = sqlite3.connect("example.db")
        cursor = conn.execute(sql_query)
        results = cursor.fetchall()
        
        if not results:
            return "No results found"
        
        # Format results
        return "\\n".join(str(row) for row in results[:100])
        
    except Exception as e:
        return f"Database error: {e}"
    finally:
        conn.close()

if __name__ == "__main__":
    mcp.run(transport="stdio")
` + "```" + `

## Client Integration Examples

### Simple Client Application
` + "```python" + `
from mcp.client import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def simple_client_example():
    server_params = StdioServerParameters(
        command="python",
        args=["server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        session = ClientSession(read, write)
        await session.initialize()
        
        # List and execute tools
        tools = await session.list_tools()
        print(f"Available tools: {[t.name for t in tools.tools]}")
        
        # Execute a tool
        result = await session.call_tool("get_weather", {"location": "San Francisco"})
        print(f"Result: {result.content[0].text}")

if __name__ == "__main__":
    asyncio.run(simple_client_example())
` + "```" + `

## Development Workflows

### 1. Basic Development Cycle
1. **Plan**: Define what tools/resources you need
2. **Implement**: Start with one tool, test with Inspector
3. **Expand**: Add more functionality incrementally
4. **Test**: Validate with real AI applications
5. **Deploy**: Package and distribute

### 2. Testing Workflow
1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test with MCP Inspector
3. **End-to-End Tests**: Test with Claude Desktop
4. **Performance Tests**: Validate under load

### 3. Deployment Workflow
1. **Local Testing**: Verify everything works locally
2. **Staging Deploy**: Test in production-like environment
3. **Production Deploy**: Deploy with monitoring
4. **Monitor**: Watch metrics and logs

## Best Practices Examples

### Error Handling Pattern
` + "```python" + `
@mcp.tool()
async def robust_api_call(endpoint: str, method: str = "GET") -> str:
    \"\"\"Make API call with comprehensive error handling.\"\"\"
    
    try:
        # Input validation
        if not endpoint.startswith(('http://', 'https://')):
            return "Error: Invalid URL format"
        
        if method not in ['GET', 'POST', 'PUT', 'DELETE']:
            return "Error: Invalid HTTP method"
        
        # Make request with timeout
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(method, endpoint)
            response.raise_for_status()
            
            return f"Success: {response.status_code} - {response.text[:500]}"
            
    except httpx.TimeoutException:
        return "Error: Request timed out"
    except httpx.HTTPStatusError as e:
        return f"Error: HTTP {e.response.status_code}"
    except Exception as e:
        return f"Error: {e}"
` + "```" + `

### Resource Management Pattern
` + "```python" + `
class ResourceManager:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def get_resource(self, uri: str):
        # Check cache
        if uri in self.cache:
            data, timestamp = self.cache[uri]
            if time.time() - timestamp < self.cache_ttl:
                return data
        
        # Load resource
        data = await self.load_resource(uri)
        
        # Cache result
        self.cache[uri] = (data, time.time())
        
        return data
` + "```" + `

## Next Steps

- **Want to implement these patterns?** → See specific building guides
- **Need deployment help?** → Use "deployment_guide"
- **Have questions?** → Check "troubleshooting" guide
        `
      }
    };

    const guide = guides[topic as keyof typeof guides];
    
    return {
      content: [{
        type: "text" as const,
        text: `# ${guide.title}

${guide.content.trim()}

---

**Need more help?** Try other guide topics: ${Object.keys(guides).join(', ')}`
      }]
    };
  }
};