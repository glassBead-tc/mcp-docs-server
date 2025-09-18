[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

Search...

Navigation

Base Protocol

Overview

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Messages](https://modelcontextprotocol.io/specification/2025-06-18/basic#messages)
- [Requests](https://modelcontextprotocol.io/specification/2025-06-18/basic#requests)
- [Responses](https://modelcontextprotocol.io/specification/2025-06-18/basic#responses)
- [Notifications](https://modelcontextprotocol.io/specification/2025-06-18/basic#notifications)
- [Auth](https://modelcontextprotocol.io/specification/2025-06-18/basic#auth)
- [Schema](https://modelcontextprotocol.io/specification/2025-06-18/basic#schema)
- [General fields](https://modelcontextprotocol.io/specification/2025-06-18/basic#general-fields)
- [\_meta](https://modelcontextprotocol.io/specification/2025-06-18/basic#meta)

**Protocol Revision**: 2025-06-18

The Model Context Protocol consists of several key components that work together:

- **Base Protocol**: Core JSON-RPC message types
- **Lifecycle Management**: Connection initialization, capability negotiation, and
session control
- **Authorization**: Authentication and authorization framework for HTTP-based transports
- **Server Features**: Resources, prompts, and tools exposed by servers
- **Client Features**: Sampling and root directory lists provided by clients
- **Utilities**: Cross-cutting concerns like logging and argument completion

All implementations **MUST** support the base protocol and lifecycle management
components. Other components **MAY** be implemented based on the specific needs of the
application.These protocol layers establish clear separation of concerns while enabling rich
interactions between clients and servers. The modular design allows implementations to
support exactly the features they need.

<h2>Messages</h2>

All messages between MCP clients and servers **MUST** follow the
[JSON-RPC 2.0](https://www.jsonrpc.org/specification) specification. The protocol defines
these types of messages:

<h3>Requests</h3>

Requests are sent from the client to the server or vice versa, to initiate an operation.

Copy

```
{\n  jsonrpc: \"2.0\";\n  id: string | number;\n  method: string;\n  params?: {\n    [key: string]: unknown;\n  };\n}\n
```

- Requests **MUST** include a string or integer ID.
- Unlike base JSON-RPC, the ID **MUST NOT** be `null`.
- The request ID **MUST NOT** have been previously used by the requestor within the same
session.

<h3>Responses</h3>

Responses are sent in reply to requests, containing the result or error of the operation.

Copy

```
{\n  jsonrpc: \"2.0\";\n  id: string | number;\n  result?: {\n    [key: string]: unknown;\n  }\n  error?: {\n    code: number;\n    message: string;\n    data?: unknown;\n  }\n}\n
```

- Responses **MUST** include the same ID as the request they correspond to.
- **Responses** are further sub-categorized as either **successful results** or
**errors**. Either a `result` or an `error` **MUST** be set. A response **MUST NOT**
set both.
- Results **MAY** follow any JSON object structure, while errors **MUST** include an
error code and message at minimum.
- Error codes **MUST** be integers.

<h3>Notifications</h3>

Notifications are sent from the client to the server or vice versa, as a one-way message.
The receiver **MUST NOT** send a response.

Copy

```
{\n  jsonrpc: \"2.0\";\n  method: string;\n  params?: {\n    [key: string]: unknown;\n  };\n}\n
```

- Notifications **MUST NOT** include an ID.

<h2>Auth</h2>

MCP provides an [Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) framework for use with HTTP.
Implementations using an HTTP-based transport **SHOULD** conform to this specification,
whereas implementations using STDIO transport **SHOULD NOT** follow this specification,
and instead retrieve credentials from the environment.Additionally, clients and servers **MAY** negotiate their own custom authentication and
authorization strategies.For further discussions and contributions to the evolution of MCP’s auth mechanisms, join
us in
[GitHub Discussions](https://github.com/modelcontextprotocol/specification/discussions)
to help shape the future of the protocol!

<h2>Schema</h2>

The full specification of the protocol is defined as a
[TypeScript schema](https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-06-18/schema.ts).
This is the source of truth for all protocol messages and structures.There is also a
[JSON Schema](https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-06-18/schema.json),
which is automatically generated from the TypeScript source of truth, for use with
various automated tooling.

<h3>General fields</h3>

<h4>`_meta`</h4>

The `_meta` property/parameter is reserved by MCP to allow clients and servers
to attach additional metadata to their interactions.Certain key names are reserved by MCP for protocol-level metadata, as specified below;
implementations MUST NOT make assumptions about values at these keys.Additionally, definitions in the [schema](https://github.com/modelcontextprotocol/specification/blob/main/schema/2025-06-18/schema.ts)
may reserve particular names for purpose-specific metadata, as declared in those definitions.**Key name format:** valid `_meta` key names have two segments: an optional **prefix**, and a **name**.**Prefix:**

- If specified, MUST be a series of labels separated by dots ( `.`), followed by a slash ( `/`).
  - Labels MUST start with a letter and end with a letter or digit; interior characters can be letters, digits, or hyphens ( `-`).
- Any prefix beginning with zero or more valid labels, followed by `modelcontextprotocol` or `mcp`, followed by any valid label,
is **reserved** for MCP use.\n  - For example: `modelcontextprotocol.io/`, `mcp.dev/`, `api.modelcontextprotocol.org/`, and `tools.mcp.com/` are all reserved.\n
**Name:**

- Unless empty, MUST begin and end with an alphanumeric character ( `[a-z0-9A-Z]`).
- MAY contain hyphens ( `-`), underscores ( `_`), dots ( `.`), and alphanumerics in between.