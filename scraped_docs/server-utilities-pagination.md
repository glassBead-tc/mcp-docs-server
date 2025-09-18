# Pagination

<div id="enable-section-numbers" />

<Info>**Protocol Revision**: 2025-06-18</Info>

The Model Context Protocol (MCP) supports paginating list operations that may return
large result sets. Pagination allows servers to yield results in smaller chunks rather
than all at once.

Pagination is especially important when connecting to external services over the
internet, but also useful for local integrations to avoid performance issues with large
data sets.

<h2>Pagination Model</h2>

Pagination in MCP uses an opaque cursor-based approach, instead of numbered pages.

* The **cursor** is an opaque string token, representing a position in the result set
* **Page size** is determined by the server, and clients **MUST NOT** assume a fixed page
  size

<h2>Response Format</h2>

Pagination starts when the server sends a **response** that includes:

* The current page of results
* An optional `nextCursor` field if more results exist

```json
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {
    "resources": [...],
    "nextCursor": "eyJwYWdlIjogM30="
  }
}
```

<h2>Request Format</h2>

After receiving a cursor, the client can *continue* paginating by issuing a request
including that cursor:

```json
{
  "jsonrpc": "2.0",
  "id": "124",
  "method": "resources/list",
  "params": {
    "cursor": "eyJwYWdlIjogMn0="
  }
}
```

<h2>Pagination Flow</h2>

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Client->>Server: List Request (no cursor)\n    loop Pagination Loop
      Server-->>Client: Page of results + nextCursor
      Client->>Server: List Request (with cursor)
    end
```

<h2>Operations Supporting Pagination</h2>

The following MCP operations support pagination:

* `resources/list` - List available resources
* `resources/templates/list` - List resource templates
* `prompts/list` - List available prompts
* `tools/list` - List available tools

<h2>Implementation Guidelines</h2>

1. Servers **SHOULD** :   * Provide stable cursors
   * Handle invalid cursors gracefully

2. Clients **SHOULD** :   * Treat a missing `nextCursor` as the end of results
   * Support both paginated and non-paginated flows

3. Clients **MUST** treat cursors as opaque tokens:   * Don't make assumptions about cursor format
   * Don't attempt to parse or modify cursors
   * Don't persist cursors across sessions

<h2>Error Handling</h2>

Invalid cursors **SHOULD** result in an error with code -32602 (Invalid params).