# MCP Documentation Server Usage Guide

## Quick Start

### Installation
```bash
# Install via NPM
npm install -g mcp-docs-server

# Or run directly with npx
npx mcp-docs-server
```

### Claude Desktop Setup
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "mcp-docs": {
      "command": "npx",
      "args": ["-y", "mcp-docs-server"]
    }
  }
}
```

Restart Claude Desktop and look for the MCP tools indicator.

## Available Tools 🔧

### 1. mcp_docs_guide
Get structured guides for MCP development topics.

**Usage in Claude:**
- "Show me the MCP getting started guide"
- "I need help building MCP servers"
- "What are the core MCP concepts?"

**Available Topics:**
- `getting_started` - Introduction and basics
- `building_servers` - Server development guide
- `building_clients` - Client development guide
- `core_concepts` - Architecture and primitives
- `tools_and_resources` - Deep dive into tools and resources
- `protocol_specification` - Technical protocol details
- `troubleshooting` - Common issues and solutions
- `best_practices` - Development best practices
- `examples_and_tutorials` - Complete examples

### 2. search_docs
Search through MCP documentation using keywords.

**Usage in Claude:**
- "Search the MCP docs for 'JSON-RPC'"
- "Find information about tool development"
- "Search for 'Claude Desktop' integration info"

**Parameters:**
- `query` (required): Search keywords or phrases
- `category` (optional): Limit search to specific category

### 3. get_docs_by_category
Browse documentation organized by category.

**Usage in Claude:**
- "Show me all development documentation"
- "What's in the MCP concepts category?"
- "Give me an overview of all documentation"

**Available Categories:**
- `overview` - Complete documentation overview
- `getting_started` - Introduction materials
- `concepts` - Core concepts and architecture
- `development` - Building servers and clients
- `specification` - Technical protocol details
- `tools` - Development tools and debugging
- `community` - Governance and contribution guidelines

## Available Prompts 💬

### 1. mcp_quick_start
Interactive guide for getting started with MCP development.

**Usage in Claude:**
- "Use the MCP quick start prompt"
- "Help me get started with MCP development"

### 2. server_development_workflow
Complete workflow for developing MCP servers.

**Usage in Claude:**
- "Guide me through building an MCP tool server in Python"
- "I want to create a mixed MCP server in TypeScript"

**Parameters:**
- `server_type`: "tool", "resource", "prompt", or "mixed"
- `language`: "python", "typescript", "java", etc.

### 3. client_integration_guide
Guide for integrating MCP servers into applications.

**Usage in Claude:**
- "How do I integrate MCP into a desktop application?"
- "Show me the web application integration guide"

**Parameters:**
- `client_type`: "desktop", "web", "mobile", "cli"

### 4. troubleshooting_workflow
Systematic troubleshooting for MCP issues.

**Usage in Claude:**
- "Help me troubleshoot MCP connection issues"
- "I'm having tool execution problems"

**Parameters:**
- `issue_type`: "connection", "tools", "resources", "performance"

### 5. deployment_guide
Production deployment guide for MCP servers.

**Usage in Claude:**
- "How do I deploy my MCP server to the cloud?"
- "Show me local deployment options"

**Parameters:**
- `deployment_target`: "local", "cloud", "container", "edge"

## Available Resources 📄

All MCP documentation files are available as resources with the URI format:
`mcp-docs://filename.md`

### Categories of Resources

#### Getting Started (Priority: 1.0)
- `mcp-docs://docs-getting-started-intro.md`
- `mcp-docs://index.md`

#### Core Concepts (Priority: 0.9)
- `mcp-docs://docs-learn-architecture.md`
- `mcp-docs://docs-concepts-tools.md`
- `mcp-docs://docs-concepts-resources.md`
- `mcp-docs://docs-concepts-prompts.md`

#### Development (Priority: 0.8)
- `mcp-docs://docs-develop-build-server.md`
- `mcp-docs://docs-develop-build-client.md`
- `mcp-docs://docs-develop-connect-local-servers.md`
- `mcp-docs://docs-develop-connect-remote-servers.md`

#### Protocol Specification (Priority: 0.7)
- `mcp-docs://basic.md`
- `mcp-docs://server.md`
- `mcp-docs://client.md`
- `mcp-docs://schema.md`

## Usage Examples

### Example Conversations with Claude

**Getting Started:**
```
You: "I want to learn about MCP. Where should I start?"
Claude: [Uses mcp_docs_guide with "getting_started" topic]
```

**Finding Specific Information:**
```
You: "How do I implement tools in MCP servers?"
Claude: [Uses search_docs to find tool implementation details]
```

**Development Workflow:**
```
You: "Guide me through building my first MCP server in Python"
Claude: [Uses server_development_workflow prompt with Python parameters]
```

**Troubleshooting:**
```
You: "My MCP server won't connect to Claude Desktop"
Claude: [Uses troubleshooting_workflow for connection issues]
```

**Resource Access:**
```
You: "Show me the complete MCP architecture documentation"
Claude: [Accesses mcp-docs://docs-learn-architecture.md resource]
```

## Advanced Usage

### Combining Multiple Capabilities

**Research Workflow:**
1. Use `get_docs_by_category("overview")` to understand scope
2. Use `search_docs("specific topic")` to find relevant docs
3. Access specific resources for detailed reading
4. Use appropriate workflow prompts for implementation

**Development Workflow:**
1. Start with `mcp_quick_start()` for basics
2. Use `server_development_workflow()` for guided development
3. Use `search_docs()` to find specific implementation details
4. Use `troubleshooting_workflow()` when issues arise
5. Use `deployment_guide()` for production deployment

### Power User Tips

**Efficient Searching:**
- Use specific technical terms: "JSON-RPC", "STDIO transport", "tool schemas"
- Combine with categories: search_docs("authentication", "specification")
- Use multiple searches to build comprehensive understanding

**Resource Management:**
- Resources are sorted by priority (getting started first)
- Resources include metadata like last modified dates
- Use resource URIs to directly access full documentation

**Workflow Optimization:**
- Start with overview to understand scope
- Use prompts for step-by-step guidance
- Use search for specific technical details
- Use resources for complete documentation

## Troubleshooting

### Server Not Working
1. Check if Node.js 18+ is installed
2. Verify the server builds: `npm run build`
3. Test with Inspector: `npx @modelcontextprotocol/inspector node build/index.js`
4. Check Claude Desktop logs: `~/Library/Logs/Claude/mcp.log`

### Tools Not Appearing in Claude
1. Verify configuration syntax in `claude_desktop_config.json`
2. Use absolute paths if needed
3. Restart Claude Desktop completely
4. Check for error messages in Claude logs

### Search Not Finding Results
1. Try different keywords or phrases
2. Use broader search terms
3. Try searching in specific categories
4. Check if documentation files are present

### Resources Not Accessible
1. Verify `scraped_docs/` directory exists
2. Check file permissions
3. Ensure markdown files are present
4. Use `get_docs_by_category("overview")` to see available resources

## Performance Notes

- **Search**: Indexes 46 documentation files, responds quickly
- **Resources**: Files are read on-demand, cached by the client
- **Guides**: Generated dynamically, optimized for readability
- **Memory**: Lightweight server, minimal resource usage

## Integration Examples

### Programmatic Usage
```typescript
// Example client integration
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client(/* config */);

// Search for information
const searchResult = await client.callTool({
  name: "search_docs",
  arguments: {
    query: "building servers",
    category: "development"
  }
});

// Get structured guide
const guide = await client.callTool({
  name: "mcp_docs_guide", 
  arguments: {
    topic: "core_concepts"
  }
});

// Access documentation resource
const architecture = await client.readResource({
  uri: "mcp-docs://docs-learn-architecture.md"
});
```

This server provides comprehensive access to MCP documentation through a standardized MCP interface, making it easy for AI applications to help users learn and develop with the Model Context Protocol.