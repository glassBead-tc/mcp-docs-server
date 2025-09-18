/**
 * Troubleshooting workflow for MCP issues
 */

export async function troubleshootingWorkflow(args: {
  issue_type?: string;
} = {}): Promise<string> {
  const { issue_type = "general" } = args;
  
  const issueTitle = issue_type === "general" ? "Common MCP Issues" : 
    issue_type.charAt(0).toUpperCase() + issue_type.slice(1) + " Issues";
  
  return `# 🔧 MCP Troubleshooting Workflow

## 🎯 Systematic Troubleshooting for ${issueTitle}

This guide provides step-by-step troubleshooting for MCP development and deployment issues.

## 🔌 Connection Issues

### Problem: Server Won't Start
**Symptoms**: Process exits immediately, no response to connections

#### Debugging Steps:
` + "```bash" + `
# 1. Test server directly
python my_server.py
# or
node my_server.js

# 2. Check for syntax errors
python -m py_compile my_server.py
# or  
npx tsc --noEmit

# 3. Test with minimal server
npx @modelcontextprotocol/inspector python -c "
from mcp.server.fastmcp import FastMCP
mcp = FastMCP('test')
mcp.run(transport='stdio')
"
` + "```" + `

#### Common Causes & Fixes:
- **Missing dependencies**: Install MCP SDK correctly
- **Python path issues**: Use absolute paths in configs
- **Import errors**: Check all imports are available
- **Environment variables**: Verify required env vars are set

### Problem: Claude Desktop Not Connecting
**Symptoms**: No MCP icon, tools don't appear

#### Configuration Check:
` + "```json" + `
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/absolute/path/to/server.py"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
` + "```" + `

#### Debugging Steps:
1. **Check configuration syntax**: Validate JSON
2. **Use absolute paths**: No relative paths or ~
3. **Restart Claude Desktop**: Complete restart required
4. **Check Claude logs**: Look in ~/Library/Logs/Claude/

## 🔧 Tool Execution Issues

### Problem: Tools Not Appearing
**Symptoms**: tools/list returns empty or tools missing from UI

#### Debugging Checklist:
` + "```python" + `
# 1. Verify tool registration
@mcp.tool()
async def my_tool(param: str) -> str:
    \"\"\"Tool description is REQUIRED.\"\"\"
    return f"Result: {param}"

# 2. Check server capabilities
server = Server({...}, {
    capabilities: {
        "tools": {}  # Must declare tools capability
    }
})
` + "```" + `

#### Common Tool Issues:
- **Missing docstring**: Tools need descriptions
- **No capabilities declared**: Must declare tools capability
- **Registration errors**: Check tool decorator syntax
- **Import failures**: Verify all tool modules load correctly

### Problem: Tool Calls Failing
**Symptoms**: Tools execute but return errors or crash

#### Error Handling Template:
` + "```python" + `
@mcp.tool()
async def robust_tool(param: str) -> str:
    \"\"\"Tool with comprehensive error handling.\"\"\"
    
    try:
        # 1. Input validation
        if not param or not param.strip():
            return "Error: Parameter cannot be empty"
        
        if len(param) > 1000:
            return "Error: Parameter too long (max 1000 characters)"
        
        # 2. Safe processing
        result = process_safely(param)
        
        # 3. Output validation
        if not result:
            return "Warning: Operation completed but no result generated"
        
        return f"Success: {result}"
        
    except ValueError as e:
        return f"Input error: {e}"
    except ConnectionError as e:
        return f"Connection error: {e}"
    except Exception as e:
        import logging
        logging.exception(f"Unexpected error in tool")
        return f"System error: {e}"
` + "```" + `

## 📄 Resource Access Issues

### Problem: Resources Not Found
**Symptoms**: resources/read returns 404 or empty responses

#### Resource Debugging:
` + "```python" + `
# 1. Check resource listing
async def debug_resources(session):
    try:
        resources = await session.list_resources()
        print(f"Found {len(resources.resources)} resources:")
        
        for resource in resources.resources:
            print(f"  URI: {resource.uri}")
            print(f"  Name: {resource.name}")
            print(f"  Type: {resource.mimeType}")
            
    except Exception as e:
        print(f"Error listing resources: {e}")

# 2. Test resource reading
async def test_resource_read(session, uri):
    try:
        content = await session.read_resource(uri)
        print(f"✓ Successfully read {uri}")
        print(f"Content length: {len(content.contents[0].text or '')}")
        
    except Exception as e:
        print(f"✗ Failed to read {uri}: {e}")
` + "```" + `

## ⚡ Performance Issues

### Problem: Slow Tool Execution
**Symptoms**: Tools take too long to respond, timeouts

#### Performance Debugging:
` + "```python" + `
import time
import asyncio

def profile_tool(func):
    \"\"\"Decorator to profile tool execution time.\"\"\"
    
    async def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        
        try:
            result = await func(*args, **kwargs)
            execution_time = time.perf_counter() - start_time
            
            if execution_time > 5.0:
                print(f"⚠️ Slow tool: {func.__name__} took {execution_time:.3f}s")
            
            return result
            
        except Exception as e:
            execution_time = time.perf_counter() - start_time
            print(f"💥 {func.__name__} failed after {execution_time:.3f}s: {e}")
            raise
    
    return wrapper

@mcp.tool()
@profile_tool
async def monitored_tool(data: str) -> str:
    \"\"\"Tool with performance monitoring.\"\"\"
    await asyncio.sleep(0.1)  # Simulate work
    return f"Processed: {data}"
` + "```" + `

## 🛠️ Debugging Tools and Utilities

### MCP Inspector Usage
` + "```bash" + `
# Basic usage
npx @modelcontextprotocol/inspector python server.py

# With environment variables
API_KEY=secret npx @modelcontextprotocol/inspector python server.py

# Remote server inspection
npx @modelcontextprotocol/inspector https://your-server.com/mcp
` + "```" + `

### Custom Debug Tools
` + "```python" + `
#!/usr/bin/env python3
import asyncio
from mcp.client import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test_mcp_server(server_command: list):
    \"\"\"Test basic MCP server functionality.\"\"\"
    
    server_params = StdioServerParameters(
        command=server_command[0],
        args=server_command[1:]
    )
    
    try:
        async with stdio_client(server_params) as (read, write):
            session = ClientSession(read, write)
            
            # Test initialization
            init_result = await session.initialize()
            print(f"✓ Server: {init_result.serverInfo.name}")
            
            # Test tool listing
            tools = await session.list_tools()
            print(f"✓ Tools: {len(tools.tools)}")
            
            # Test resource listing
            resources = await session.list_resources()
            print(f"✓ Resources: {len(resources.resources)}")
            
            print("✅ All tests passed")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

# Usage: python debug_client.py server.py
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python debug_client.py <server_command> [args...]")
        sys.exit(1)
    
    server_cmd = sys.argv[1:]
    asyncio.run(test_mcp_server(server_cmd))
` + "```" + `

## 📋 Common Solutions Checklist

### ✅ Connection Issues
- [ ] Server starts without errors
- [ ] Configuration JSON is valid
- [ ] Absolute paths used in configuration
- [ ] Claude Desktop restarted completely
- [ ] Environment variables set correctly

### ✅ Tool Issues
- [ ] Tools have proper descriptions
- [ ] Tool capabilities declared in server
- [ ] Input schemas are valid JSON Schema
- [ ] Error handling implemented
- [ ] Tools tested with MCP Inspector

### ✅ Resource Issues
- [ ] Resource URIs are valid
- [ ] File permissions correct
- [ ] Resources declared in capabilities
- [ ] Content types specified correctly

### ✅ Performance Issues
- [ ] Tool execution time monitored
- [ ] Memory usage reasonable
- [ ] Error rates acceptable
- [ ] Rate limiting implemented if needed

## 🆘 When All Else Fails

### 1. Minimal Reproduction
Create the simplest possible server:
` + "```python" + `
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("minimal")

@mcp.tool()
async def hello() -> str:
    \"\"\"Say hello.\"\"\"
    return "Hello from MCP!"

if __name__ == "__main__":
    mcp.run(transport="stdio")
` + "```" + `

### 2. Step-by-Step Debugging
1. Test minimal server with Inspector
2. Add one feature at a time
3. Test after each addition
4. Identify what breaks the server

### 3. Community Help
- Check MCP GitHub discussions
- Join community chat channels  
- Post detailed error reports
- Include logs and configuration

## 💡 Prevention Tips

1. **Start Small**: Build incrementally
2. **Test Continuously**: Use Inspector throughout development
3. **Follow Patterns**: Use established MCP patterns
4. **Document Issues**: Keep track of solutions
5. **Stay Updated**: Follow MCP releases and updates

## Next Steps

- **Still stuck?** Try mcp_quick_start() for basics
- **Need examples?** Use get_docs_by_category("development")
- **Ready for production?** Check deployment_guide()
- **Want best practices?** Use mcp_docs_guide("best_practices")

Remember: Most MCP issues are configuration or environment related. Work systematically through the checklist above!`;
}