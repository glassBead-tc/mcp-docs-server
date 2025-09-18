[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

Ctrl K

Search...

Navigation

Key Changes

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Major changes](https://modelcontextprotocol.io/specification/2025-06-18/changelog#major-changes)
- [Other schema changes](https://modelcontextprotocol.io/specification/2025-06-18/changelog#other-schema-changes)
- [Full changelog](https://modelcontextprotocol.io/specification/2025-06-18/changelog#full-changelog)

This document lists changes made to the Model Context Protocol (MCP) specification since
the previous revision, [2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26).

<h2>Major changes</h2>

1. Remove support for JSON-RPC **[batching](https://www.jsonrpc.org/specification#batch)**
(PR [#416](https://github.com/modelcontextprotocol/specification/pull/416))
2. Add support for [structured tool output](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content)
(PR [#371](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/371))
3. Classify MCP servers as [OAuth Resource Servers](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#authorization-server-discovery),
adding protected resource metadata to discover the corresponding Authorization server.
(PR [#338](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/338))
4. Require MCP clients to implement Resource Indicators as described in [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html) to prevent
malicious servers from obtaining access tokens.
(PR [#734](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/734))
5. Clarify [security considerations](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization#security-considerations) and best practices
in the authorization spec and in a new [security best practices page](https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices).
6. Add support for **[elicitation](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation)**, enabling servers to request additional
information from users during interactions.
(PR [#382](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/382))
7. Add support for **[resource links](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#resource-links)** in
tool call results. (PR [#603](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/603))
8. Require [negotiated protocol version to be specified](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#protocol-version-header)
via `MCP-Protocol-Version` header in subsequent requests when using HTTP (PR [#548](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/548)).
9. Change **SHOULD** to **MUST** in [Lifecycle Operation](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#operation)

<h2>Other schema changes</h2>

1. Add `_meta` field to additional interface types (PR [#710](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/710)),
and specify [proper usage](https://modelcontextprotocol.io/specification/2025-06-18/basic#meta).
2. Add `context` field to `CompletionRequest`, providing for completion requests to include
previously-resolved variables (PR [#598](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/598)).
3. Add `title` field for human-friendly display names, so that `name` can be used as a programmatic
identifier (PR [#663](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/663))

<h2>Full changelog</h2>

For a complete list of all changes that have been made since the last protocol revision,
[see GitHub](https://github.com/modelcontextprotocol/specification/compare/2025-03-26...2025-06-18).

Was this page helpful?

YesNo

[Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Architecture](https://modelcontextprotocol.io/specification/2025-06-18/architecture/index)

Assistant

Responses are generated using AI and may contain mistakes.