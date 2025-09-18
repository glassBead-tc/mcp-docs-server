[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

Search...

Navigation

Utilities

Ping

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Overview](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#overview)
- [Message Format](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#message-format)
- [Behavior Requirements](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#behavior-requirements)
- [Usage Patterns](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#usage-patterns)
- [Implementation Considerations](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#implementation-considerations)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping#error-handling)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) includes an optional ping mechanism that allows either party
to verify that their counterpart is still responsive and the connection is alive.

<h2>Overview</h2>

The ping functionality is implemented through a simple request/response pattern. Either
the client or server can initiate a ping by sending a `ping` request.

<h2>Message Format</h2>

A ping request is a standard JSON-RPC request with no parameters:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": \"123\",\n  \"method\": \"ping\"\n}\n
```

<h2>Behavior Requirements</h2>

1. The receiver **MUST** respond promptly with an empty response:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": \"123\",\n  \"result\": {}\n}\n
```

2. If no response is received within a reasonable timeout period, the sender **MAY** :
   - Consider the connection stale
   - Terminate the connection
   - Attempt reconnection procedures

<h2>Usage Patterns</h2>

<h2>Implementation Considerations</h2>

- Implementations **SHOULD** periodically issue pings to detect connection health
- The frequency of pings **SHOULD** be configurable
- Timeouts **SHOULD** be appropriate for the network environment
- Excessive pinging **SHOULD** be avoided to reduce network overhead

<h2>Error Handling</h2>

- Timeouts **SHOULD** be treated as connection failures
- Multiple failed pings **MAY** trigger connection reset
- Implementations **SHOULD** log ping failures for diagnostics