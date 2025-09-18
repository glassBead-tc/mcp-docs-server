[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

Search...

Navigation

Server Features

Prompts

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [User Interaction Model](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#user-interaction-model)
- [Capabilities](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#capabilities)
- [Protocol Messages](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#protocol-messages)
- [Listing Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#listing-prompts)
- [Getting a Prompt](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#getting-a-prompt)
- [List Changed Notification](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#list-changed-notification)
- [Message Flow](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#message-flow)
- [Data Types](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#data-types)
- [Prompt](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#prompt)
- [PromptMessage](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#promptmessage)
- [Text Content](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#text-content)
- [Image Content](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#image-content)
- [Audio Content](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#audio-content)
- [Embedded Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#embedded-resources)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#error-handling)
- [Implementation Considerations](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#implementation-considerations)
- [Security](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts#security)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) provides a standardized way for servers to expose prompt
templates to clients. Prompts allow servers to provide structured messages and
instructions for interacting with language models. Clients can discover available
prompts, retrieve their contents, and provide arguments to customize them.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#user-interaction-model) User Interaction Model

Prompts are designed to be **user-controlled**, meaning they are exposed from servers to
clients with the intention of the user being able to explicitly select them for use.Typically, prompts would be triggered through user-initiated commands in the user
interface, which allows users to naturally discover and invoke available prompts.For example, as slash commands:![Example of prompt exposed as slash command](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/specification/2025-06-18/server/slash-command.png?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=7f003e36d881dd6f3e5b8cbdd85e5ca5)However, implementors are free to expose prompts through any interface pattern that suits
their needs—the protocol itself does not mandate any specific user interaction
model.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#capabilities) Capabilities

Servers that support prompts **MUST** declare the `prompts` capability during
[initialization](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization):

Copy

```
{
  "capabilities": {
    "prompts": {
      "listChanged": true
    }
  }
}

```

`listChanged` indicates whether the server will emit notifications when the list of
available prompts changes.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#protocol-messages) Protocol Messages

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#listing-prompts) Listing Prompts

To retrieve available prompts, clients send a `prompts/list` request. This operation
supports [pagination](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/pagination).**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "prompts/list",
  "params": {
    "cursor": "optional-cursor-value"
  }
}

```

**Response:**

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"result\": {\n    \"prompts\": [\\\n      {\\\n        \"name\": \"code_review\",\\\n        \"title\": \"Request Code Review\",\\\n        \"description\": \"Asks the LLM to analyze code quality and suggest improvements\",\\\n        \"arguments\": [\\\n          {\\\n            \"name\": \"code\",\\\n            \"description\": \"The code to review\",\\\n            \"required\": true\\\n          }\\\n        ]\\\n      }\\\n    ],\n    \"nextCursor\": \"next-page-cursor\"\n  }\n}\n
```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#getting-a-prompt) Getting a Prompt

To retrieve a specific prompt, clients send a `prompts/get` request. Arguments may be
auto-completed through [the completion API](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/completion).**Request:**

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 2,\n  \"method\": \"prompts/get\",\n  \"params\": {\n    \"name\": \"code_review\",\n    \"arguments\": {\n      \"code\": \"def hello():\\n    print('world')\"\n    }\n  }\n}\n
```

**Response:**

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 2,\n  \"result\": {\n    \"description\": \"Code review prompt\",\n    \"messages\": [\\\n      {\\\n        \"role\": \"user\",\\\n        \"content\": {\\\n          \"type\": \"text\",\\\n          \"text\": \"Please review this Python code:\\ndef hello():\\n    print('world')\"\\\n        }\\\n      }\\\n    ]\n  }\n}\n
```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#list-changed-notification) List Changed Notification

When the list of available prompts changes, servers that declared the `listChanged`
capability **SHOULD** send a notification:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/prompts/list_changed\"\n}\n
```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#message-flow) Message Flow

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#data-types) Data Types

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#prompt) Prompt

A prompt definition includes:

- `name`: Unique identifier for the prompt
- `title`: Optional human-readable name of the prompt for display purposes.
- `description`: Optional human-readable description
- `arguments`: Optional list of arguments for customization

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#promptmessage) PromptMessage

Messages in a prompt can contain:

- `role`: Either “user” or “assistant” to indicate the speaker
- `content`: One of the following content types:

All content types in prompt messages support optional
[annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) for
metadata about audience, priority, and modification times.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#text-content) Text Content

Text content represents plain text messages:

Copy

```
{\n  \"type\": \"text\",\n  \"text\": \"The text content of the message\"\n}\n
```

This is the most common content type used for natural language interactions.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#image-content) Image Content

Image content allows including visual information in messages:

Copy

```
{\n  \"type\": \"image\",\n  \"data\": \"base64-encoded-image-data\",\n  \"mimeType\": \"image/png\"\n}\n
```

The image data **MUST** be base64-encoded and include a valid MIME type. This enables
multi-modal interactions where visual context is important.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#audio-content) Audio Content

Audio content allows including audio information in messages:

Copy

```
{\n  \"type\": \"audio\",\n  \"data\": \"base64-encoded-audio-data\",\n  \"mimeType\": \"audio/wav\"\n}\n
```

The audio data MUST be base64-encoded and include a valid MIME type. This enables
multi-modal interactions where audio context is important.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#embedded-resources) Embedded Resources

Embedded resources allow referencing server-side resources directly in messages:

Copy

```
{\n  \"type\": \"resource\",\n  \"resource\": {\n    \"uri\": \"resource://example\",\n    \"name\": \"example\",\n    \"title\": \"My Example Resource\",\n    \"mimeType\": \"text/plain\",\n    \"text\": \"Resource content\"\n  }\n}\n
```

Resources can contain either text or binary (blob) data and **MUST** include:

- A valid resource URI
- The appropriate MIME type
- Either text content or base64-encoded blob data

Embedded resources enable prompts to seamlessly incorporate server-managed content like
documentation, code samples, or other reference materials directly into the conversation
flow.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#error-handling) Error Handling

Servers **SHOULD** return standard JSON-RPC errors for common failure cases:

- Invalid prompt name: `-32602` (Invalid params)
- Missing required arguments: `-32602` (Invalid params)
- Internal errors: `-32603` (Internal error)

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#implementation-considerations) Implementation Considerations

1. Servers **SHOULD** validate prompt arguments before processing
2. Clients **SHOULD** handle pagination for large prompt lists
3. Both parties **SHOULD** respect capability negotiation

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts\#security) Security

Implementations **MUST** carefully validate all prompt inputs and outputs to prevent
injection attacks or unauthorized access to resources.

Was this page helpful?

YesNo

[Overview](https://modelcontextprotocol.io/specification/2025-06-18/server) [Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources)

Assistant

Responses are generated using AI and may contain mistakes.