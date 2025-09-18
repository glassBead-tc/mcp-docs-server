[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

Ctrl K

Search...

Navigation

Utilities

Progress

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Progress Flow](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress#progress-flow)
- [Behavior Requirements](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress#behavior-requirements)
- [Implementation Notes](https://modelcontextprotocol.io/specification/2025-06-18/basic/utilities/progress#implementation-notes)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) supports optional progress tracking for long-running
operations through notification messages. Either side can send progress notifications to
provide updates about operation status.

<h2>Progress Flow</h2>

When a party wants to _receive_ progress updates for a request, it includes a
`progressToken` in the request metadata.

- Progress tokens **MUST** be a string or integer value
- Progress tokens can be chosen by the sender using any means, but **MUST** be unique
across all active requests.

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"method\": \"some_method\",\n  \"params\": {\n    \"_meta\": {\n      \"progressToken\": \"abc123\"\n    }\n  }\n}\n
```

The receiver **MAY** then send progress notifications containing:

- The original progress token
- The current progress value so far
- An optional “total” value
- An optional “message” value

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/progress\",\n  \"params\": {\n    \"progressToken\": \"abc123\",\n    \"progress\": 50,\n    \"total\": 100,\n    \"message\": \"Reticulating splines...\"\n  }\n}\n
```

- The `progress` value **MUST** increase with each notification, even if the total is
unknown.
- The `progress` and the `total` values **MAY** be floating point.
- The `message` field **SHOULD** provide relevant human readable progress information.

<h2>Behavior Requirements</h2>

1. Progress notifications **MUST** only reference tokens that:   - Were provided in an active request
   - Are associated with an in-progress operation
2. Receivers of progress requests **MAY** :   - Choose not to send any progress notifications
   - Send notifications at whatever frequency they deem appropriate
   - Omit the total value if unknown

<h2>Implementation Notes</h2>

- Senders and receivers **SHOULD** track active progress tokens
- Both parties **SHOULD** implement rate limiting to prevent flooding
- Progress notifications **MUST** stop after completion