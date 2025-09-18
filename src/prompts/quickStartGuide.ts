/**
 * Quick start guide for MCP development
 */

export async function quickStartGuide(): Promise<string> {
  return `# 🚀 MCP Quick Start Guide

## 🎯 From Zero to Working MCP Server in 15 Minutes

Welcome to Model Context Protocol! Let's get you building your first MCP server quickly.

## What is MCP?

MCP is like **USB-C for AI applications** - a standardized way to connect AI apps to external systems, data, and tools.

### What can you build?
- **🔧 Tools**: Functions AI can execute (database queries, API calls, calculations)
- **📄 Resources**: Data sources AI can read (files, databases, APIs)
- **💬 Prompts**: Templates to guide AI interactions

## Step 1: Choose Your Language

### Python (Recommended for beginners)
` + "```bash" + `
# Install uv (fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create new project
uv init my-mcp-server
cd my-mcp-server

# Install MCP SDK
uv add "mcp[cli]"

# Create server file
touch server.py
` + "```" + `

### TypeScript/Node.js
` + "```bash" + `
# Create new project
mkdir my-mcp-server
cd my-mcp-server
npm init -y

# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Create server file
touch server.ts
` + "```" + `

## Step 2: Write Your First Tool

### Simple Python Server
` + "```python" + `
#!/usr/bin/env python3
from mcp.server.fastmcp import FastMCP
from datetime import datetime

# Initialize server
mcp = FastMCP("my-first-server")

@mcp.tool()
async def get_current_time() -> str:
    """Get the current time."""
    return f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

@mcp.tool()
async def echo_message(message: str, uppercase: bool = False) -> str:
    """Echo a message back.
    
    Args:
        message: The message to echo
        uppercase: Whether to convert to uppercase
    """
    if not message:
        return "Error: Message cannot be empty"
    
    result = message.upper() if uppercase else message
    return f"Echo: {result}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
` + "```" + `

## Step 3: Test Your Server

### With MCP Inspector
` + "```bash" + `
# Test your server interactively
npx @modelcontextprotocol/inspector python server.py
` + "```" + `

This opens a web interface where you can:
- ✅ See your tools listed
- ✅ Test tool calls with parameters
- ✅ View responses and debug issues

### With Claude Desktop
1. **Add to Claude configuration**:
` + "```json" + `
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"]
    }
  }
}
` + "```" + `

2. **Restart Claude Desktop completely**

3. **Test your tools**:
   - "What time is it?" → Uses get_current_time tool
   - "Echo 'Hello World' in uppercase" → Uses echo_message tool

## Step 4: Add Resources and Prompts

### Add a Resource
` + "```python" + `
@mcp.resource("info://server")
async def server_info():
    """Server information resource."""
    return f"""
# My MCP Server

This server provides:
- Time utilities
- Echo functionality
- Server information

Started at: {datetime.now().isoformat()}
"""
` + "```" + `

### Add a Prompt
` + "```python" + `
@mcp.prompt()
async def coding_helper(language: str = "python") -> str:
    """Get a coding assistant prompt."""
    return f"""You are an expert {language} developer. Help the user with:
- Writing clean, efficient code
- Debugging issues
- Following best practices

Focus on practical, working solutions and explain your reasoning clearly.
"""
` + "```" + `

## Step 5: Complete Example

Here's everything combined:

` + "```python" + `
#!/usr/bin/env python3
from mcp.server.fastmcp import FastMCP
from datetime import datetime
import sys

# Initialize server
mcp = FastMCP("complete-example-server")

@mcp.tool()
async def get_current_time() -> str:
    """Get the current time."""
    return f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

@mcp.tool()
async def calculate(expression: str) -> str:
    """Calculate a math expression safely."""
    try:
        # Basic validation
        allowed_chars = set('0123456789+-*/()., ')
        if not all(c in allowed_chars for c in expression):
            return "Error: Only basic math allowed"
        
        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error: {e}"

@mcp.resource("server://info")
async def server_info():
    """Server information."""
    return f"""# MCP Server Info
Server: complete-example-server
Status: Running
Time: {datetime.now().isoformat()}
"""

@mcp.prompt()
async def math_helper() -> str:
    """Get a math helper prompt."""
    return "You are a helpful math assistant. Help solve calculations and explain mathematical concepts clearly."

if __name__ == "__main__":
    print("🚀 Starting Complete Example MCP Server...", file=sys.stderr)
    mcp.run(transport="stdio")
` + "```" + `

## 🏁 What's Next?

### Immediate Next Steps:
1. **Test your server** with MCP Inspector
2. **Connect to Claude Desktop** and try the tools
3. **Experiment** with different tool implementations

### Learning Path:
- **Advanced Development**: Use server_development_workflow()
- **Client Integration**: Try client_integration_guide()
- **Production Deployment**: Check deployment_guide()
- **Troubleshooting**: Reference troubleshooting_workflow()

## 💡 Pro Tips

1. **Start Simple**: One tool, then expand
2. **Test Early**: Use MCP Inspector constantly
3. **Good Descriptions**: Help AI understand your tools
4. **Error Handling**: Make tools robust
5. **Documentation**: Document your tools well

## 🆘 Getting Help

- **Search docs**: Use search_docs("your question")
- **Browse topics**: Use get_docs_by_category()
- **Troubleshooting**: Use troubleshooting_workflow()
- **Community**: Check MCP community resources

Happy building! 🚀`;
}