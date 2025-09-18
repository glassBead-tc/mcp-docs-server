# MCP Documentation Server 📚

A Model Context Protocol (MCP) server that provides comprehensive access to MCP documentation, guides, and development workflows through a standardized interface.

## Features ✨

This MCP server provides comprehensive documentation access through:

### 🔧 Tools
- **mcp_docs_guide**: Structured guides for MCP development topics
- **search_docs**: Full-text search across all MCP documentation  
- **get_docs_by_category**: Browse documentation by category

### 💬 Prompts
Interactive workflows for MCP development:
- **mcp_quick_start**: Get started quickly with MCP development
- **server_development_workflow**: Complete server development workflow
- **client_integration_guide**: Guide for integrating MCP into applications
- **troubleshooting_workflow**: Systematic troubleshooting guide
- **deployment_guide**: Production deployment best practices

### 📄 Resources  
Direct access to individual documentation files:
- **mcp-docs://filename.md**: Access any documentation file directly
- Organized by category with rich metadata
- Full markdown content with proper formatting

## Installation 📦

### NPM Installation
```bash
npm install -g mcp-docs-server
```

### Using with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

### Local Development
```bash
# Clone and setup
git clone <repository-url>
cd mcp-docs-server
npm install

# Build
npm run build

# Run locally
npm run dev

# Test with MCP Inspector
npx @modelcontextprotocol/inspector npm run dev
```

## Usage 🚀

### Getting Started
```bash
# Ask for getting started guide
mcp_docs_guide("getting_started")

# Quick start workflow
mcp_quick_start()
```

### Finding Documentation
```bash
# Search for specific topics
search_docs("tools development")
search_docs("JSON-RPC protocol", "specification")

# Browse by category
get_docs_by_category("concepts")
get_docs_by_category("development")
```

### Development Workflows
```bash
# Server development workflow
server_development_workflow("tool", "python")

# Client integration guide
client_integration_guide("desktop")

# Troubleshooting
troubleshooting_workflow("connection")
```

### Accessing Documentation Resources
```bash
# Access specific documentation files
Resource: mcp-docs://docs-getting-started-intro.md
Resource: mcp-docs://docs-learn-architecture.md
Resource: mcp-docs://docs-develop-build-server.md
```

## Documentation Categories 📖

The server organizes MCP documentation into these categories:

- **🚀 getting_started**: Introduction and basic concepts
- **🧠 concepts**: Architecture, primitives, and design principles  
- **🛠️ development**: Building servers and clients
- **📋 specification**: Technical protocol details
- **🔧 tools**: Development tools and debugging
- **👥 community**: Governance and contribution guidelines

## Example Workflows 💡

### New Developer Workflow
1. Start with `mcp_quick_start()` for overview
2. Use `mcp_docs_guide("getting_started")` for structured introduction
3. Follow `server_development_workflow()` to build first server
4. Use `search_docs()` to find specific implementation details

### Experienced Developer Workflow  
1. Use `search_docs()` to find specific information
2. Access documentation resources directly via URIs
3. Reference `troubleshooting_workflow()` when issues arise
4. Use `deployment_guide()` for production deployment

### Integration Developer Workflow
1. Start with `client_integration_guide()` for your platform
2. Use `get_docs_by_category("development")` for implementation details
3. Reference protocol specification via `get_docs_by_category("specification")`
4. Use debugging tools and workflows as needed

## Architecture 🏗️

The server follows the same patterns as other MCP servers:

```
┌─────────────────────────────────┐
│         AI Application          │
│      ┌─────────────────┐        │
│      │   MCP Client    │        │
│      └─────────────────┘        │
└─────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│      MCP Docs Server            │
│                                 │
│  📚 Documentation Database      │
│  🔍 Search Engine              │  
│  🎯 Guided Workflows           │
│  📄 Resource Access            │
└─────────────────────────────────┘
```

### Key Components

- **Documentation Engine**: Processes and categorizes scraped MCP docs
- **Search System**: Full-text search with relevance ranking
- **Guide Generator**: Creates structured learning workflows
- **Resource Provider**: Serves individual documentation files
- **Prompt System**: Interactive development workflows

## Development 👨‍💻

### Project Structure
```
mcp-docs-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── tools/                # MCP tools implementation
│   │   ├── mcpDocsGuide.ts   # Main documentation guide
│   │   ├── searchDocs.ts     # Documentation search
│   │   └── getDocsByCategory.ts # Category browsing
│   ├── prompts/              # Interactive workflows
│   │   ├── index.ts          # Prompt registry
│   │   ├── quickStartGuide.ts
│   │   ├── serverDevelopmentWorkflow.ts
│   │   ├── clientIntegrationGuide.ts
│   │   ├── troubleshootingWorkflow.ts
│   │   └── deploymentGuide.ts
│   └── resources/            # Resource access
│       └── index.ts          # Documentation file access
├── scraped_docs/             # MCP documentation files
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Documentation

1. Add markdown files to `scraped_docs/` directory
2. Files are automatically categorized and indexed
3. Search and resource access work immediately
4. No server restart required

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting 🔧

### Server Not Starting
```bash
# Check TypeScript compilation
npm run build

# Test directly
node build/index.js

# Check with inspector
npx @modelcontextprotocol/inspector node build/index.js
```

### Claude Desktop Integration Issues
1. Check configuration syntax in `claude_desktop_config.json`
2. Use absolute paths if needed
3. Restart Claude Desktop completely
4. Check Claude logs: `~/Library/Logs/Claude/mcp.log`

### Documentation Not Found
1. Verify `scraped_docs/` directory exists
2. Check file permissions
3. Ensure markdown files are present
4. Check server logs for errors

## API Reference 📋

### Tools

#### mcp_docs_guide
Get structured guides for MCP development topics.

**Parameters:**
- `topic` (required): Topic to get guidance on
  - `getting_started`: Introduction and basics
  - `building_servers`: Server development guide
  - `building_clients`: Client development guide  
  - `core_concepts`: Architecture and primitives
  - `tools_and_resources`: Deep dive into tools and resources
  - `protocol_specification`: Technical protocol details
  - `troubleshooting`: Common issues and solutions
  - `best_practices`: Development best practices
  - `examples_and_tutorials`: Complete examples

#### search_docs
Search through MCP documentation using keywords.

**Parameters:**
- `query` (required): Search query string
- `category` (optional): Limit search to specific category

#### get_docs_by_category
Browse documentation organized by category.

**Parameters:**
- `category` (required): Documentation category to explore

### Resources

All documentation files are available as resources with URI format:
`mcp-docs://filename.md`

Example resources:
- `mcp-docs://docs-getting-started-intro.md`
- `mcp-docs://docs-learn-architecture.md`  
- `mcp-docs://docs-develop-build-server.md`

## License 📄

MIT License - see LICENSE file for details.

## Support 💬

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Use the server itself to explore MCP documentation
- **Community**: Join MCP community discussions
- **Contributing**: See CONTRIBUTING.md for guidelines

---

Built with ❤️ for the MCP community