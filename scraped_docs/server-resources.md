[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

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

<h2>User Interaction Model</h2>
Resources in MCP are designed to be **application-driven**, with host applications
determining how to incorporate context based on their needs.

For example, applications could:

- Expose resources through UI elements for explicit selection, in a tree or list view
- Allow the user to search through and filter available resources
- Implement automatic context inclusion, based on heuristics or the AI model’s selection

![Example of resource context picker](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/specification/2025-06-18/server/resource-picker.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=133fa885ef6e9c2e20049da5c33f4386)However, implementations are free to expose resources through any interface pattern that
suits their needs—the protocol itself does not mandate any specific user
interaction model.

<h2>Capabilities</h2>

Servers that support resources **MUST** declare the `resources` capability:

Copy

```
{\n  \"capabilities\": {\n    \"resources\": {\n      \"subscribe\": true,\n      \"listChanged\": true\n    }\n  }\n}\n
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
{\n  \"capabilities\": {\n    \"resources\": {} // Neither feature supported\n  }\n}\n
```

Copy

```
{\n  \"capabilities\": {\n    \"resources\": {\n      \"subscribe\": true // Only subscriptions supported\n    }\n  }\n}\n
```

Copy

```
{\n  \"capabilities\": {\n    \"resources\": {\n      \"listChanged\": true // Only list change notifications supported\n    }\n  }\n}\n
```

<h2>Protocol Messages</h2>

<h3>Listing Resources</h3>

To discover available resources, clients send a `resources/list` request. This operation
supports [pagination](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/pagination).

**Request:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"method\": \"resources/list\",\n  \"params\": {\n    \"cursor\": \"optional-cursor-value\"\n  }\n}\n
```

**Response:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"result\": {\n    \"resources\": [\\\n      {\\\n        \"uri\": \"file:///project/src/main.rs\",\\\n        \"name\": \"main.rs\",\\\n        \"title\": \"Rust Software Application Main File\",\\\n        \"description\": \"Primary application entry point\",\\\n        \"mimeType\": \"text/x-rust\"\\\n      }\\\n    ],\n    \"nextCursor\": \"next-page-cursor\"\n  }\n}\n
```

<h3>Reading Resources</h3>

To retrieve resource contents, clients send a `resources/read` request:

**Request:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 2,\n  \"method\": \"resources/read\",\n  \"params\": {\n    \"uri\": \"file:///project/src/main.rs\"\n  }\n}\n
```

**Response:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 2,\n  \"result\": {\n    \"contents\": [\\\n      {\\\n        \"uri\": \"file:///project/src/main.rs\",\\\n        \"name\": \"main.rs\",\\\n        \"title\": \"Rust Software Application Main File\",\\\n        \"mimeType\": \"text/x-rust\",\\\n        \"text\": \"fn main() {\\n    println!(\\\"Hello world!\\\");\\n}\"\\\n      }\\\n    ]\n  }\n}\n
```

<h3>Resource Templates</h3>

Resource templates allow servers to expose parameterized resources using
[URI templates](https://datatracker.ietf.org/doc/html/rfc6570). Arguments may be
auto-completed through [the completion API](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/completion).

**Request:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 3,\n  \"method\": \"resources/templates/list\"\n}\n
```

**Response:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 3,\n  \"result\": {\n    \"resourceTemplates\": [\\\n      {\\\n        \"uriTemplate\": \"file:///{path}\",\\\n        \"name\": \"Project Files\",\\\n        \"title\": \"📁 Project Files\",\\\n        \"description\": \"Access files in the project directory\",\\\n        \"mimeType\": \"application/octet-stream\"\\\n      }\\\n    ],\n    \"nextCursor\": \"next-page-cursor\"\n  }\n}\n
```

<h3>List Changed Notification</h3>

When the list of available resources changes, servers that declared the `listChanged`
capability **SHOULD** send a notification:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/resources/list_changed\"\n}\n
```

<h3>Subscriptions</h3>

The protocol supports optional subscriptions to resource changes. Clients can subscribe
to specific resources and receive notifications when they change:

**Subscribe Request:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 4,\n  \"method\": \"resources/subscribe\",\n  \"params\": {\n    \"uri\": \"file:///project/src/main.rs\"\n  }\n}\n
```

**Update Notification:**

```json
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/resources/updated\",\n  \"params\": {\n    \"uri\": \"file:///project/src/main.rs\",\n    \"title\": \"Rust Software Application Main File\"\n  }\n}\n
```

<h2>Message Flow</h2>

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Note over Client,Server: Resource Discovery
    Client->>Server: resources/list
    Server-->>Client: List of resources

    Note over Client,Server: Resource Access
    Client->>Server: resources/read
    Server-->>Client: Resource contents

    Note over Client,Server: Subscriptions
    Client->>Server: resources/subscribe
    Server-->>Client: Subscription confirmed

    Note over Client,Server: Updates
    Server--)Client: notifications/resources/updated
    Client->>Server: resources/read
    Server-->>Client: Updated contents
```

<h2>Data Types</h2>

<h3>Resource</h3>

* `uri`: Unique identifier for the resource
* `name`: The name of the resource.
* `title`: Optional human-readable name of the resource for display purposes.
* `description`: Optional description
* `mimeType`: Optional MIME type
* `size`: Optional size in bytes

<h3>Resource Contents</h3>

Resources can contain either text or binary data:

<h4>Text Content</h4>

```json
{\n  \"uri\": \"file:///example.txt\",\n  \"name\": \"example.txt\",\n  \"title\": \"Example Text File\",\n  \"mimeType\": \"text/plain\",\n  \"text\": \"Resource content\"\n}\n
```

<h4>Binary Content</h4>

```json
{\n  \"uri\": \"file:///example.png\",\n  \"name\": \"example.png\",\n  \"title\": \"Example Image\",\n  \"mimeType\": \"image/png\",\n  \"blob\": \"base64-encoded-data\"\n}\n
```

<h3>Annotations</h3>

Resources, resource templates and content blocks support optional annotations that provide hints to clients about how to use or display the resource:

* **`audience`**: An array indicating the intended audience(s) for this resource. Valid values are `\"user\"` and `\"assistant\"`. For example, `[\"user\", \"assistant\"]` indicates content useful for both.
* **`priority`**: A number from 0.0 to 1.0 indicating the importance of this resource. A value of 1 means “most important” (effectively required), while 0 means “least important” (entirely optional).
* **`lastModified`**: An ISO 8601 formatted timestamp indicating when the resource was last modified (e.g., `\"2025-01-12T15:00:58Z\"`).

Example resource with annotations:

```json
{\n  \"uri\": \"file:///project/README.md\",\n  \"name\": \"README.md\",\n  \"title\": \"Project Documentation\",\n  \"mimeType\": \"text/markdown\",\n  \"annotations\": {\n    \"audience\": [\"user\"],\n    \"priority\": 0.8,\n    \"lastModified\": \"2025-01-12T15:00:58Z\"\n  }\n}\n
```

Clients can use these annotations to:

* Filter resources based on their intended audience
* Prioritize which resources to include in context
* Display modification times or sort by recency

<h2>Common URI Schemes</h2>

The protocol defines several standard URI schemes. This list not
exhaustive—implementations are always free to use additional, custom URI schemes.

<h3>https://</h3>

Used to represent a resource available on the web.

Servers **SHOULD** use this scheme only when the client is able to fetch and load the
resource directly from the web on its own—that is, it doesn’t need to read the resource
via the MCP server.

For other use cases, servers **SHOULD** prefer to use another URI scheme, or define a
custom one, even if the server will itself be downloading resource contents over the
internet.

<h3>file://</h3>

Used to identify resources that behave like a filesystem. However, the resources do not
need to map to an actual physical filesystem.

MCP servers **MAY** identify file:// resources with an
[XDG MIME type](https://specifications.freedesktop.org/shared-mime-info-spec/0.14/ar01s02.html#id-1.3.14),
like `inode/directory`, to represent non-regular files (such as directories) that don’t
otherwise have a standard MIME type.

<h3>git://</h3>

Git version control integration.

<h3>Custom URI Schemes</h3>

Custom URI schemes **MUST** be in accordance with [RFC3986](https://datatracker.ietf.org/doc/html/rfc3986),
taking the above guidance in to account.

<h2>Error Handling</h2>

Servers **SHOULD** return standard JSON-RPC errors for common failure cases:

* Resource not found: `-32002`
* Internal errors: `-32603`

Example error:

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "error": {
    "code": -32002,
    "message": "Resource not found",
    "data": {
      "uri": "file:///nonexistent.txt"
    }
  }
}
```

<h2>Security Considerations</h2>

1. Servers **MUST** validate all resource URIs
2. Access controls **SHOULD** be implemented for sensitive resources
3. Binary data **MUST** be properly encoded
4. Resource permissions **SHOULD** be checked before operations