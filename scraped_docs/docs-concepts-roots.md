[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

Search...

Navigation

Client Features

Roots

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [User Interaction Model](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#user-interaction-model)
- [Capabilities](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#capabilities)
- [Protocol Messages](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#protocol-messages)
- [Listing Roots](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#listing-roots)
- [Root List Changes](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#root-list-changes)
- [Message Flow](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#message-flow)
- [Data Types](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#data-types)
- [Root](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#root)
- [Project Directory](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#project-directory)
- [Multiple Repositories](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#multiple-repositories)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#error-handling)
- [Security Considerations](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#security-considerations)
- [Implementation Guidelines](https://modelcontextprotocol.io/specification/2025-06-18/client/roots#implementation-guidelines)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) provides a standardized way for clients to expose
filesystem “roots” to servers. Roots define the boundaries of where servers can operate
within the filesystem, allowing them to understand which directories and files they have
access to. Servers can request the list of roots from supporting clients and receive
notifications when that list changes.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#user-interaction-model) User Interaction Model

Roots in MCP are typically exposed through workspace or project configuration interfaces.For example, implementations could offer a workspace/project picker that allows users to
select directories and files the server should have access to. This can be combined with
automatic workspace detection from version control systems or project files.However, implementations are free to expose roots through any interface pattern that
suits their needs—the protocol itself does not mandate any specific user
interaction model.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#capabilities) Capabilities

Clients that support roots **MUST** declare the `roots` capability during
[initialization](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization):

Copy

```
{
  "capabilities": {
    "roots": {
      "listChanged": true
    }
  }
}

```

`listChanged` indicates whether the client will emit notifications when the list of roots
changes.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#protocol-messages) Protocol Messages

### [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#listing-roots) Listing Roots

To retrieve roots, servers send a `roots/list` request:**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "roots/list"
}

```

**Response:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "roots": [
      {
        "uri": "file:///home/user/projects/myproject",
        "name": "My Project"
      }
    ]
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#root-list-changes) Root List Changes

When roots change, clients that support `listChanged` **MUST** send a notification:

Copy

```
{
  "jsonrpc": "2.0",
  "method": "notifications/roots/list_changed"
}

```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#message-flow) Message Flow

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#data-types) Data Types

### [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#root) Root

A root definition includes:

- `uri`: Unique identifier for the root. This **MUST** be a `file://` URI in the current
spec of the protocol.
- `name`: Optional human-readable name for display purposes.

Example roots for different use cases:

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#project-directory) Project Directory

Copy

```
{
  "uri": "file:///home/user/projects/myproject",
  "name": "My Project"
}

```

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#multiple-repositories) Multiple Repositories

Copy

```
[
  {
    "uri": "file:///home/user/repos/frontend",
    "name": "Frontend Repository"
  },
  {
    "uri": "file:///home/user/repos/backend",
    "name": "Backend Repository"
  }
]

```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#error-handling) Error Handling

Clients **SHOULD** return standard JSON-RPC errors for common failure cases:

- Client does not support roots: `-32601` (Method not found)
- Internal errors: `-32603`

Example error:

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Roots not supported",
    "data": {
      "reason": "Client does not have roots capability"
    }
  }
}

```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#security-considerations) Security Considerations

1. Clients **MUST**:   - Only expose roots with appropriate permissions
   - Validate all root URIs to prevent path traversal
   - Implement proper access controls
   - Monitor root accessibility
2. Servers **SHOULD**:   - Handle cases where roots become unavailable
   - Respect root boundaries during operations
   - Validate all paths against provided roots

## [​](https://modelcontextprotocol.io/specification/2025-06-18/client/roots\#implementation-guidelines) Implementation Guidelines

1. Clients **SHOULD**:   - Prompt users for consent before exposing roots to servers
   - Provide clear user interfaces for root management
   - Validate root accessibility before exposing
   - Monitor for root changes
2. Servers **SHOULD**:   - Check for roots capability before usage
   - Handle root list changes gracefully
   - Respect root boundaries in operations
   - Cache root information appropriately

Was this page helpful?

YesNo

[Progress](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress) [Sampling](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling)

Assistant

Responses are generated using AI and may contain mistakes.