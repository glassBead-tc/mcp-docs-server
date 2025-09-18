[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

Ctrl K

Search...

Navigation

Server Features

Resources

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [User Interaction Model](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#user-interaction-model)
- [Capabilities](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#capabilities)
- [Protocol Messages](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#protocol-messages)
- [Listing Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#listing-resources)
- [Reading Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#reading-resources)
- [Resource Templates](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#resource-templates)
- [List Changed Notification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#list-changed-notification)
- [Subscriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#subscriptions)
- [Message Flow](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#message-flow)
- [Data Types](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#data-types)
- [Resource](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#resource)
- [Resource Contents](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#resource-contents)
- [Text Content](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#text-content)
- [Binary Content](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#binary-content)
- [Annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations)
- [Common URI Schemes](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#common-uri-schemes)
- [https://](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#https%3A%2F%2F)
- [file://](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#file%3A%2F%2F)
- [git://](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#git%3A%2F%2F)
- [Custom URI Schemes](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#custom-uri-schemes)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#error-handling)
- [Security Considerations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#security-considerations)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) provides a standardized way for servers to expose
resources to clients. Resources allow servers to share data that provides context to
language models, such as files, database schemas, or application-specific information.
Each resource is uniquely identified by a
[URI](https://datatracker.ietf.org/doc/html/rfc3986).

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#user-interaction-model) User Interaction Model

Resources in MCP are designed to be **application-driven**, with host applications
determining how to incorporate context based on their needs.For example, applications could:

- Expose resources through UI elements for explicit selection, in a tree or list view
- Allow the user to search through and filter available resources
- Implement automatic context inclusion, based on heuristics or the AI model’s selection

![Example of resource context picker](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/specification/2025-06-18/server/resource-picker.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=133fa885ef6e9c2e20049da5c33f4386)However, implementations are free to expose resources through any interface pattern that
suits their needs—the protocol itself does not mandate any specific user
interaction model.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#capabilities) Capabilities

Servers that support resources **MUST** declare the `resources` capability:

Copy

```
{
  "capabilities": {
    "resources": {
      "subscribe": true,
      "listChanged": true
    }
  }
}

```

The capability supports two optional features:

- `subscribe`: whether the client can subscribe to be notified of changes to individual
resources.
- `listChanged`: whether the server will emit notifications when the list of available
resources changes.

Both `subscribe` and `listChanged` are optional—servers can support neither,
either, or both:

Copy

```
{
  "capabilities": {
    "resources": {} // Neither feature supported
  }
}

```

Copy

```
{
  "capabilities": {
    "resources": {
      "subscribe": true // Only subscriptions supported
    }
  }
}

```

Copy

```
{
  "capabilities": {
    "resources": {
      "listChanged": true // Only list change notifications supported
    }
  }
}

```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#protocol-messages) Protocol Messages

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#listing-resources) Listing Resources

To discover available resources, clients send a `resources/list` request. This operation
supports [pagination](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/pagination).**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}

```

**Response:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "file:///project/src/main.rs",
        "name": "main.rs",
        "title": "Rust Software Application Main File",
        "description": "Primary application entry point",
        "mimeType": "text/x-rust"
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#reading-resources) Reading Resources

To retrieve resource contents, clients send a `resources/read` request:**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "file:///project/src/main.rs"
  }
}

```

**Response:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [
      {
        "uri": "file:///project/src/main.rs",
        "name": "main.rs",
        "title": "Rust Software Application Main File",
        "mimeType": "text/x-rust",
        "text": "fn main() {\n    println!(\"Hello world!\");\n}"
      }
    ]
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#resource-templates) Resource Templates

Resource templates allow servers to expose parameterized resources using
[URI templates](https://datatracker.ietf.org/doc/html/rfc6570). Arguments may be
auto-completed through [the completion API](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/completion).**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/templates/list"
}

```

**Response:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "resourceTemplates": [
      {
        "uriTemplate": "file:///{path}",
        "name": "Project Files",
        "title": "📁 Project Files",
        "description": "Access files in the project directory",
        "mimeType": "application/octet-stream"
      }
    ]
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#list-changed-notification) List Changed Notification

When the list of available resources changes, servers that declared the `listChanged`
capability **SHOULD** send a notification:

Copy

```
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/list_changed"
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#subscriptions) Subscriptions

The protocol supports optional subscriptions to resource changes. Clients can subscribe
to specific resources and receive notifications when they change:**Subscribe Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/subscribe",
  "params": {
    "uri": "file:///project/src/main.rs"
  }
}

```

**Update Notification:**

Copy

```
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": {
    "uri": "file:///project/src/main.rs",
    "title": "Rust Software Application Main File"
  }
}

```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#message-flow) Message Flow

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#data-types) Data Types

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#resource) Resource

A resource definition includes:

- `uri`: Unique identifier for the resource
- `name`: The name of the resource.
- `title`: Optional human-readable name of the resource for display purposes.
- `description`: Optional description
- `mimeType`: Optional MIME type
- `size`: Optional size in bytes

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#resource-contents) Resource Contents

Resources can contain either text or binary data:

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#text-content) Text Content

Copy

```
{\n  \"uri\": \"file:///example.txt\",\n  \"name\": \"example.txt\",\n  \"title\": \"Example Text File\",\n  \"mimeType\": \"text/plain\",\n  \"text\": \"Resource content\"\n}\n
```

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#binary-content) Binary Content

Copy

```
{\n  \"uri\": \"file:///example.png\",\n  \"name\": \"example.png\",\n  \"title\": \"Example Image\",\n  \"mimeType\": \"image/png\",\n  \"blob\": \"base64-encoded-data\"\n}\n
```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#annotations) Annotations

Resources, resource templates and content blocks support optional annotations that provide hints to clients about how to use or display the resource:

- **`audience`**: An array indicating the intended audience(s) for this resource. Valid values are `"user"` and `"assistant"`. For example, `["user", "assistant"]` indicates content useful for both.
- **`priority`**: A number from 0.0 to 1.0 indicating the importance of this resource. A value of 1 means “most important” (effectively required), while 0 means “least important” (entirely optional).
- **`lastModified`**: An ISO 8601 formatted timestamp indicating when the resource was last modified (e.g., `"2025-01-12T15:00:58Z"`).

Example resource with annotations:

Copy

```
{\n  \"uri\": \"file:///project/README.md\",\n  \"name\": \"README.md\",\n  \"title\": \"Project Documentation\",\n  \"mimeType\": \"text/markdown\",\n  \"annotations\": {\n    \"audience\": [\"user\"],\n    \"priority\": 0.8,\n    \"lastModified\": \"2025-01-12T15:00:58Z\"\n  }\n}\n
```

Clients can use these annotations to:

- Filter resources based on their intended audience
- Prioritize which resources to include in context
- Display modification times or sort by recency

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#common-uri-schemes) Common URI Schemes

The protocol defines several standard URI schemes. This list not
exhaustive—implementations are always free to use additional, custom URI schemes.

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#https%3A%2F%2F) https://

Used to represent a resource available on the web.Servers **SHOULD** use this scheme only when the client is able to fetch and load the
resource directly from the web on its own—that is, it doesn’t need to read the resource
via the MCP server.For other use cases, servers **SHOULD** prefer to use another URI scheme, or define a
custom one, even if the server will itself be downloading resource contents over the
internet.

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#file%3A%2F%2F) file://

Used to identify resources that behave like a filesystem. However, the resources do not
need to map to an actual physical filesystem.MCP servers **MAY** identify file:// resources with an
[XDG MIME type](https://specifications.freedesktop.org/shared-mime-info-spec/0.14/ar01s02.html#id-1.3.14),
like `inode/directory`, to represent non-regular files (such as directories) that don’t
otherwise have a standard MIME type.

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#git%3A%2F%2F) git://

Git version control integration.

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#custom-uri-schemes) Custom URI Schemes

Custom URI schemes **MUST** be in accordance with [RFC3986](https://datatracker.ietf.org/doc/html/rfc3986),
taking the above guidance in to account.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#error-handling) Error Handling

Servers **SHOULD** return standard JSON-RPC errors for common failure cases:

- Resource not found: `-32002`
- Internal errors: `-32603`

Example error:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 5,\n  \"error\": {\n    \"code\": -32002,\n    \"message\": \"Resource not found\",\n    \"data\": {\n      \"uri\": \"file:///nonexistent.txt\"\n    }\n  }\n}\n
```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/resources\#security-considerations) Security Considerations

1. Servers **MUST** validate all resource URIs
2. Access controls **SHOULD** be implemented for sensitive resources
3. Binary data **MUST** be properly encoded
4. Resource permissions **SHOULD** be checked before operations

Was this page helpful?

YesNo

[Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts) [Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

Assistant

Responses are generated using AI and may contain mistakes.

![Example of resource context picker](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/specification/2025-06-18/server/resource-picker.png?w=840&fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0d19d08d43fe75f27ee43fb89d5e31b)