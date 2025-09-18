[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Search...

Ctrl K

Search...

Navigation

Debugging

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Debugging tools overview](https://modelcontextprotocol.io/legacy/tools/debugging#debugging-tools-overview)
- [Debugging in Claude Desktop](https://modelcontextprotocol.io/legacy/tools/debugging#debugging-in-claude-desktop)
- [Checking server status](https://modelcontextprotocol.io/legacy/tools/debugging#checking-server-status)
- [Viewing logs](https://modelcontextprotocol.io/legacy/tools/debugging#viewing-logs)
- [Using Chrome DevTools](https://modelcontextprotocol.io/legacy/tools/debugging#using-chrome-devtools)
- [Common issues](https://modelcontextprotocol.io/legacy/tools/debugging#common-issues)
- [Working directory](https://modelcontextprotocol.io/legacy/tools/debugging#working-directory)
- [Environment variables](https://modelcontextprotocol.io/legacy/tools/debugging#environment-variables)
- [Server initialization](https://modelcontextprotocol.io/legacy/tools/debugging#server-initialization)
- [Connection problems](https://modelcontextprotocol.io/legacy/tools/debugging#connection-problems)
- [Implementing logging](https://modelcontextprotocol.io/legacy/tools/debugging#implementing-logging)
- [Server-side logging](https://modelcontextprotocol.io/legacy/tools/debugging#server-side-logging)
- [Client-side logging](https://modelcontextprotocol.io/legacy/tools/debugging#client-side-logging)
- [Debugging workflow](https://modelcontextprotocol.io/legacy/tools/debugging#debugging-workflow)
- [Development cycle](https://modelcontextprotocol.io/legacy/tools/debugging#development-cycle)
- [Testing changes](https://modelcontextprotocol.io/legacy/tools/debugging#testing-changes)
- [Best practices](https://modelcontextprotocol.io/legacy/tools/debugging#best-practices)
- [Logging strategy](https://modelcontextprotocol.io/legacy/tools/debugging#logging-strategy)
- [Security considerations](https://modelcontextprotocol.io/legacy/tools/debugging#security-considerations)
- [Getting help](https://modelcontextprotocol.io/legacy/tools/debugging#getting-help)
- [Next steps](https://modelcontextprotocol.io/legacy/tools/debugging#next-steps)

Effective debugging is essential when developing MCP servers or integrating them with applications. This guide covers the debugging tools and approaches available in the MCP ecosystem.

This guide is for macOS. Guides for other platforms are coming soon.

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#debugging-tools-overview) Debugging tools overview

MCP provides several tools for debugging at different levels:

1. **MCP Inspector**   - Interactive debugging interface
   - Direct server testing
   - See the [Inspector guide](https://modelcontextprotocol.io/legacy/tools/inspector) for details
2. **Claude Desktop Developer Tools**   - Integration testing
   - Log collection
   - Chrome DevTools integration
3. **Server Logging**   - Custom logging implementations
   - Error tracking
   - Performance monitoring

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#debugging-in-claude-desktop) Debugging in Claude Desktop

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#checking-server-status) Checking server status

The Claude.app interface provides basic server status information:

1. Click the ![](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-plug-icon.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=6dbffe2b165581db1a15fa563e731587) icon to view:   - Connected servers
   - Available prompts and resources
2. Click the “Search and tools” ![](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/images/claude-desktop-mcp-slider.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=2742ec3fb97067e8591e68546c90221e) icon to view:   - Tools made available to the model

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#viewing-logs) Viewing logs

Review detailed MCP logs from Claude Desktop:

Copy

```
# Follow logs in real-time
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log

```

The logs capture:

- Server connection events
- Configuration issues
- Runtime errors
- Message exchanges

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#using-chrome-devtools) Using Chrome DevTools

Access Chrome’s developer tools inside Claude Desktop to investigate client-side errors:

1. Create a `developer_settings.json` file with `allowDevTools` set to true:

Copy

```
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json

```

2. Open DevTools: `Command-Option-Shift-i`

Note: You’ll see two DevTools windows:

- Main content window
- App title bar window

Use the Console panel to inspect client-side errors.Use the Network panel to inspect:

- Message payloads
- Connection timing

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#common-issues) Common issues

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#working-directory) Working directory

When using MCP servers with Claude Desktop:

- The working directory for servers launched via `claude_desktop_config.json` may be undefined (like `/` on macOS) since Claude Desktop could be started from anywhere
- Always use absolute paths in your configuration and `.env` files to ensure reliable operation
- For testing servers directly via command line, the working directory will be where you run the command

For example in `claude_desktop_config.json`, use:

Copy

```
{
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/Users/username/data"
  ]
}

```

Instead of relative paths like `./data`

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#environment-variables) Environment variables

MCP servers inherit only a subset of environment variables automatically, like `USER`, `HOME`, and `PATH`.To override the default variables or provide your own, you can specify an `env` key in `claude_desktop_config.json`:

Copy

```
{
  "myserver": {
    "command": "mcp-server-myapp",
    "env": {
      "MYAPP_API_KEY": "some_key"
    }
  }
}

```

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#server-initialization) Server initialization

Common initialization problems:

1. **Path Issues**   - Incorrect server executable path
   - Missing required files
   - Permission problems
   - Try using an absolute path for `command`
2. **Configuration Errors**   - Invalid JSON syntax
   - Missing required fields
   - Type mismatches
3. **Environment Problems**   - Missing environment variables
   - Incorrect variable values
   - Permission restrictions

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#connection-problems) Connection problems

When servers fail to connect:

1. Check Claude Desktop logs
2. Verify server process is running
3. Test standalone with [Inspector](https://modelcontextprotocol.io/legacy/tools/inspector)
4. Verify protocol compatibility

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#implementing-logging) Implementing logging

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#server-side-logging) Server-side logging

When building a server that uses the local stdio [transport](https://modelcontextprotocol.io/legacy/concepts/transports), all messages logged to stderr (standard error) will be captured by the host application (e.g., Claude Desktop) automatically.

Local MCP servers should not log messages to stdout (standard out), as this will interfere with protocol operation.

For all [transports](https://modelcontextprotocol.io/legacy/concepts/transports), you can also provide logging to the client by sending a log message notification:

Python

TypeScript

Copy

```
server.request_context.session.send_log_message(
  level="info",
  data="Server started successfully",
)

```

Important events to log:

- Initialization steps
- Resource access
- Tool execution
- Error conditions
- Performance metrics

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#client-side-logging) Client-side logging

In client applications:

1. Enable debug logging
2. Monitor network traffic
3. Track message exchanges
4. Record error states

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#debugging-workflow) Debugging workflow

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#development-cycle) Development cycle

1. Initial Development   - Use [Inspector](https://modelcontextprotocol.io/legacy/tools/inspector) for basic testing
   - Implement core functionality
   - Add logging points
2. Integration Testing   - Test in Claude Desktop
   - Monitor logs
   - Check error handling

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#testing-changes) Testing changes

To test changes efficiently:

- **Configuration changes**: Restart Claude Desktop
- **Server code changes**: Use Command-R to reload
- **Quick iteration**: Use [Inspector](https://modelcontextprotocol.io/legacy/tools/inspector) during development

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#best-practices) Best practices

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#logging-strategy) Logging strategy

1. **Structured Logging**   - Use consistent formats
   - Include context
   - Add timestamps
   - Track request IDs
   - Track error patterns
   - Monitor recovery
2. **Performance Tracking**   - Log operation timing
   - Monitor resource usage
   - Track message sizes
   - Measure latency

### [​](https://modelcontextprotocol.io/legacy/tools/debugging\#security-considerations) Security considerations

When debugging:

1. **Sensitive Data**   - Sanitize logs
   - Protect credentials
   - Mask personal information
2. **Access Control**   - Verify permissions
   - Check authentication
   - Monitor access patterns

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#getting-help) Getting help

When encountering issues:

1. **First Steps**   - Check server logs
   - Test with [Inspector](https://modelcontextprotocol.io/legacy/tools/inspector)
   - Review configuration
   - Verify environment
2. **Support Channels**   - GitHub issues
   - GitHub discussions
3. **Providing Information**   - Log excerpts
   - Configuration files
   - Steps to reproduce
   - Environment details

## [​](https://modelcontextprotocol.io/legacy/tools/debugging\#next-steps) Next steps

[**MCP Inspector** \\
\\
Learn to use the MCP Inspector](https://modelcontextprotocol.io/legacy/tools/inspector)

Was this page helpful?

YesNo

Assistant

Responses are generated using AI and may contain mistakes.