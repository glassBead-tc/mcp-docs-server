[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

Ctrl K

Search...

Navigation

Base Protocol

Lifecycle

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Lifecycle Phases](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#lifecycle-phases)
- [Initialization](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization)
- [Version Negotiation](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#version-negotiation)
- [Capability Negotiation](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#capability-negotiation)
- [Operation](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#operation)
- [Shutdown](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#shutdown)
- [stdio](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#stdio)
- [HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#http)
- [Timeouts](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#timeouts)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#error-handling)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) defines a rigorous lifecycle for client-server
connections that ensures proper capability negotiation and state management.

1. **Initialization**: Capability negotiation and protocol version agreement
2. **Operation**: Normal protocol communication
3. **Shutdown**: Graceful termination of the connection

<h2>Lifecycle Phases</h2>

<h3>Initialization</h3>

The initialization phase **MUST** be the first interaction between client and server.
During this phase, the client and server:

- Establish protocol version compatibility
- Exchange and negotiate capabilities
- Share implementation details

The client **MUST** initiate this phase by sending an `initialize` request containing:

- Protocol version supported
- Client capabilities
- Client implementation information

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"method\": \"initialize\",\n  \"params\": {\n    \"protocolVersion\": \"2024-11-05\",\n    \"capabilities\": {\n      \"roots\": {\n        \"listChanged\": true\n      },\n      \"sampling\": {},\n      \"elicitation\": {}\n    },\n    \"clientInfo\": {\n      \"name\": \"ExampleClient\",\n      \"title\": \"Example Client Display Name\",\n      \"version\": \"1.0.0\"\n    }\n  }\n}\n
```

The server **MUST** respond with its own capabilities and information:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"result\": {\n    \"protocolVersion\": \"2024-11-05\",\n    \"capabilities\": {\n      \"logging\": {},\n      \"prompts\": {\n        \"listChanged\": true\n      },\n      \"resources\": {\n        \"subscribe\": true,\n        \"listChanged\": true\n      },\n      \"tools\": {\n        \"listChanged\": true\n      }\n    },\n    \"serverInfo\": {\n      \"name\": \"ExampleServer\",\n      \"title\": \"Example Server Display Name\",\n      \"version\": \"1.0.0\"\n    },\n    \"instructions\": \"Optional instructions for the client\"\n  }\n}\n
```

After successful initialization, the client **MUST** send an `initialized` notification
to indicate it is ready to begin normal operations:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/initialized\"\n}\n
```

- The client **SHOULD NOT** send requests other than
[pings](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping) before the server has responded to the
`initialize` request.
- The server **SHOULD NOT** send requests other than
[pings](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/ping) and
[logging](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/logging) before receiving the `initialized`
notification.

<h4>Version Negotiation</h4>

In the `initialize` request, the client **MUST** send a protocol version it supports.
This **SHOULD** be the _latest_ version supported by the client.If the server supports the requested protocol version, it **MUST** respond with the same
version. Otherwise, the server **MUST** respond with another protocol version it
supports. This **SHOULD** be the _latest_ version supported by the server.If the client does not support the version in the server’s response, it **SHOULD**
disconnect.

If using HTTP, the client **MUST** include the `MCP-Protocol-Version: <protocol-version>` HTTP header on all subsequent requests to the MCP
server.
For details, see [the Protocol Version Header section in Transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#protocol-version-header).

<h4>Capability Negotiation</h4>

Client and server capabilities establish which optional protocol features will be
available during the session.Key capabilities include:

| Category | Capability | Description |
| --- | --- | --- |
| Client | `roots` | Ability to provide filesystem [roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots) |
| Client | `sampling` | Support for LLM [sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) requests |
| Client | `elicitation` | Support for server [elicitation](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation) requests |
| Client | `experimental` | Describes support for non-standard experimental features |
| Server | `prompts` | Offers [prompt templates](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts) |
| Server | `resources` | Provides readable [resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) |
| Server | `tools` | Exposes callable [tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) |
| Server | `logging` | Emits structured [log messages](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/logging) |
| Server | `completions` | Supports argument [autocompletion](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/completion) |
| Server | `experimental` | Describes support for non-standard experimental features |

Capability objects can describe sub-capabilities like:

- `listChanged`: Support for list change notifications (for prompts, resources, and
tools)
- `subscribe`: Support for subscribing to individual items’ changes (resources only)

<h3>Operation</h3>

During the operation phase, the client and server exchange messages according to the
negotiated capabilities.Both parties **MUST** :

- Respect the negotiated protocol version
- Only use capabilities that were successfully negotiated

<h3>Shutdown</h3>

During the shutdown phase, one side (usually the client) cleanly terminates the protocol
connection. No specific shutdown messages are defined—instead, the underlying transport
mechanism should be used to signal connection termination:

<h4>stdio</h4>

For the stdio [transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports), the client **SHOULD** initiate
shutdown by:

1. First, closing the input stream to the child process (the server)
2. Waiting for the server to exit, or sending `SIGTERM` if the server does not exit
within a reasonable time
3. Sending `SIGKILL` if the server does not exit within a reasonable time after `SIGTERM`

The server **MAY** initiate shutdown by closing its output stream to the client and
exiting.

<h4>HTTP</h4>

For HTTP [transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports), shutdown is indicated by closing the
associated HTTP connection(s).

<h2>Timeouts</h2>

Implementations **SHOULD** establish timeouts for all sent requests, to prevent hung
connections and resource exhaustion. When the request has not received a success or error
response within the timeout period, the sender **SHOULD** issue a [cancellation
notification](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/cancellation) for that request and stop waiting for
a response.SDKs and other middleware **SHOULD** allow these timeouts to be configured on a
per-request basis.Implementations **MAY** choose to reset the timeout clock when receiving a [progress
notification](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress) corresponding to the request, as this
implies that work is actually happening. However, implementations **SHOULD** always
enforce a maximum timeout, regardless of progress notifications, to limit the impact of a
misbehaving client or server.

<h2>Error Handling</h2>

Implementations **SHOULD** be prepared to handle these error cases:

- Protocol version mismatch
- Failure to negotiate required capabilities
- Request [timeouts](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#timeouts)

Example initialization error:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"error\": {\n    \"code\": -32602,\n    \"message\": \"Unsupported protocol version\",\n    \"data\": {\n      \"supported\": [\"2024-11-05\"],\n      \"requested\": \"1.0.0\"\n    }\n  }\n}\n
```

Was this page helpful?

YesNo

[Overview](https://modelcontextprotocol.io/specification/2025-06-18/basic) [Transports](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)

Assistant

Responses are generated using AI and may contain mistakes.