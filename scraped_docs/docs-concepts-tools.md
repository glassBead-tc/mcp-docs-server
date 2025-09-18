[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

⌘K

Search...

Navigation

Server Features

Tools

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [User Interaction Model](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#user-interaction-model)
- [Capabilities](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#capabilities)
- [Protocol Messages](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#protocol-messages)
- [Listing Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#listing-tools)
- [Calling Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#calling-tools)
- [List Changed Notification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#list-changed-notification)
- [Message Flow](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#message-flow)
- [Data Types](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#data-types)
- [Tool](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool)
- [Tool Result](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result)
- [Text Content](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#text-content)
- [Image Content](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#image-content)
- [Audio Content](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#audio-content)
- [Resource Links](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#resource-links)
- [Embedded Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#embedded-resources)
- [Structured Content](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content)
- [Output Schema](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#output-schema)
- [Error Handling](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#error-handling)
- [Security Considerations](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#security-considerations)

**Protocol Revision**: 2025-06-18

The Model Context Protocol (MCP) allows servers to expose tools that can be invoked by
language models. Tools enable models to interact with external systems, such as querying
databases, calling APIs, or performing computations. Each tool is uniquely identified by
a name and includes metadata describing its schema.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#user-interaction-model) User Interaction Model

Tools in MCP are designed to be **model-controlled**, meaning that the language model can
discover and invoke tools automatically based on its contextual understanding and the
user’s prompts.However, implementations are free to expose tools through any interface pattern that
suits their needs—the protocol itself does not mandate any specific user
interaction model.

For trust & safety and security, there **SHOULD** always
be a human in the loop with the ability to deny tool invocations.Applications **SHOULD**:

- Provide UI that makes clear which tools are being exposed to the AI model
- Insert clear visual indicators when tools are invoked
- Present confirmation prompts to the user for operations, to ensure a human is in the
loop

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#capabilities) Capabilities

Servers that support tools **MUST** declare the `tools` capability:

Copy

```
{
  "capabilities": {
    "tools": {
      "listChanged": true
    }
  }
}

```

`listChanged` indicates whether the server will emit notifications when the list of
available tools changes.

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#protocol-messages) Protocol Messages

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#listing-tools) Listing Tools

To discover available tools, clients send a `tools/list` request. This operation supports
[pagination](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/pagination).**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
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
    "tools": [
      {
        "name": "get_weather",
        "title": "Weather Information Provider",
        "description": "Get current weather information for a location",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    ],
    "nextCursor": "next-page-cursor"
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#calling-tools) Calling Tools

To invoke a tool, clients send a `tools/call` request:**Request:**

Copy

```
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_weather",
    "arguments": {
      "location": "New York"
    }
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
    "content": [
      {
        "type": "text",
        "text": "Current weather in New York:\nTemperature: 72°F\nConditions: Partly cloudy"
      }
    ],
    "isError": false
  }
}

```

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#list-changed-notification) List Changed Notification

When the list of available tools changes, servers that declared the `listChanged`
capability **SHOULD** send a notification:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"notifications/tools/list_changed\"\n}\n
```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#message-flow) Message Flow

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#data-types) Data Types

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#tool) Tool

A tool definition includes:

- `name`: Unique identifier for the tool
- `title`: Optional human-readable name of the tool for display purposes.
- `description`: Human-readable description of functionality
- `inputSchema`: JSON Schema defining expected parameters
- `outputSchema`: Optional JSON Schema defining expected output structure
- `annotations`: optional properties describing tool behavior

For trust & safety and security, clients **MUST** consider
tool annotations to be untrusted unless they come from trusted servers.

### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#tool-result) Tool Result

Tool results may contain [**structured**](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#structured-content) or **unstructured** content.**Unstructured** content is returned in the `content` field of a result, and can contain multiple content items of different types:

All content types (text, image, audio, resource links, and embedded resources)
support optional
[annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) that
provide metadata about audience, priority, and modification times. This is the
same annotation format used by resources and prompts.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#text-content) Text Content

Copy

```
{\n  \"type\": \"text\",\n  \"text\": \"Tool result text\"\n}\n
```

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#image-content) Image Content

Copy

```
{\n  \"type\": \"image\",\n  \"data\": \"base64-encoded-data\",\n  \"mimeType\": \"image/png\"\n  \"annotations\": {\n    \"audience\": [\"user\"],\n    \"priority\": 0.9\n  }\n\n}\n
```

This example demonstrates the use of an optional Annotation.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#audio-content) Audio Content

Copy

```
{\n  \"type\": \"audio\",\n  \"data\": \"base64-encoded-audio-data\",\n  \"mimeType\": \"audio/wav\"\n}\n
```

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#resource-links) Resource Links

A tool **MAY** return links to [Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources), to provide additional context
or data. In this case, the tool will return a URI that can be subscribed to or fetched by the client:

Copy

```
{\n  \"type\": \"resource_link\",\n  \"uri\": \"file:///project/src/main.rs\",\n  \"name\": \"main.rs\",\n  \"description\": \"Primary application entry point\",\n  \"mimeType\": \"text/x-rust\",\n  \"annotations\": {\n    \"audience\": [\"assistant\"],\n    \"priority\": 0.9\n  }\n}\n
```

Resource links support the same [Resource annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) as regular resources to help clients understand how to use them.

Resource links returned by tools are not guaranteed to appear in the results
of a `resources/list` request.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#embedded-resources) Embedded Resources

[Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) **MAY** be embedded to provide additional context
or data using a suitable [URI scheme](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#common-uri-schemes). Servers that use embedded resources **SHOULD** implement the `resources` capability:

Copy

```
{\n  \"type\": \"resource\",\n  \"resource\": {\n    \"uri\": \"file:///project/src/main.rs\",\n    \"title\": \"Project Rust Main File\",\n    \"mimeType\": \"text/x-rust\",\n    \"text\": \"fn main() {\\n    println!(\\\"Hello world!\\\");\\n}\",\n    \"annotations\": {\n      \"audience\": [\"user\", \"assistant\"],\n      \"priority\": 0.7,\n      \"lastModified\": \"2025-05-03T14:30:00Z\"\n    }\n  }\n}\n
```

Embedded resources support the same [Resource annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) as regular resources to help clients understand how to use them.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#structured-content) Structured Content

**Structured** content is returned as a JSON object in the `structuredContent` field of a result.For backwards compatibility, a tool that returns structured content SHOULD also return the serialized JSON in a TextContent block.

#### [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#output-schema) Output Schema

Tools may also provide an output schema for validation of structured results.
If an output schema is provided:

- Servers **MUST** provide structured results that conform to this schema.
- Clients **SHOULD** validate structured results against this schema.

Example tool with output schema:

Copy

```
{\n  \"name\": \"get_weather_data\",\n  \"title\": \"Weather Data Retriever\",\n  \"description\": \"Get current weather data for a location\",\n  \"inputSchema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"location\": {\n        \"type\": \"string\",\n        \"description\": \"City name or zip code\"\n      }\n    },\n    \"required\": [\"location\"]\n  },\n  \"outputSchema\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"temperature\": {\n        \"type\": \"number\",\n        \"description\": \"Temperature in celsius\"\n      },\n      \"conditions\": {\n        \"type\": \"string\",\n        \"description\": \"Weather conditions description\"\n      },\n      \"humidity\": {\n        \"type\": \"number\",\n        \"description\": \"Humidity percentage\"\n      }\n    },\n    \"required\": [\"temperature\", \"conditions\", \"humidity\"]\n  }\n}\n
```

Example valid response for this tool:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 5,\n  \"result\": {\n    \"content\": [\\\n      {\\\n        \"type\": \"text\",\\\n        \"text\": \"{\\\"temperature\\\": 22.5, \\\"conditions\\\": \\\"Partly cloudy\\\", \\\"humidity\\\": 65}\"\\\n      }\\\n    ],\n    \"structuredContent\": {\n      \"temperature\": 22.5,\n      \"conditions\": \"Partly cloudy\",\n      \"humidity\": 65\n    }\n  }\n}\n
```

Providing an output schema helps clients and LLMs understand and properly handle structured tool outputs by:

- Enabling strict schema validation of responses
- Providing type information for better integration with programming languages
- Guiding clients and LLMs to properly parse and utilize the returned data
- Supporting better documentation and developer experience

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#error-handling) Error Handling

Tools use two error reporting mechanisms:

1. **Protocol Errors**: Standard JSON-RPC errors for issues like:   - Unknown tools
   - Invalid arguments
   - Server errors
2. **Tool Execution Errors**: Reported in tool results with `isError: true`:   - API failures
   - Invalid input data
   - Business logic errors

Example protocol error:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 3,\n  \"error\": {\n    \"code\": -32602,\n    \"message\": \"Unknown tool: invalid_tool_name\"\n  }\n}\n
```

Example tool execution error:

Copy

```
{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 4,\n  \"result\": {\n    \"content\": [\\\n      {\\\n        \"type\": \"text\",\\\n        \"text\": \"Failed to fetch weather data: API rate limit exceeded\"\\\n      }\\\n    ],\n    \"isError\": true\n  }\n}\n
```

## [​](https://modelcontextprotocol.io/specification/2025-06-18/server/tools\#security-considerations) Security Considerations

1. Servers **MUST**:   - Validate all tool inputs
   - Implement proper access controls
   - Rate limit tool invocations
   - Sanitize tool outputs
2. Clients **SHOULD**:   - Prompt for user confirmation on sensitive operations
   - Show tool inputs to the user before calling the server, to avoid malicious or
     accidental data exfiltration
   - Validate tool results before passing to LLM
   - Implement timeouts for tool calls
   - Log tool usage for audit purposes

Was this page helpful?

YesNo

[Resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) [Completion](https://modelcontextprotocol.io/specification/2025-06-18/server/utilities/completion)

Assistant

Responses are generated using AI and may contain mistakes.