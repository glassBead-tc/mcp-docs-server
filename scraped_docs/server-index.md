[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Version 2025-06-18 (latest)

Search...

Ctrl K

Search...

Navigation

Server Features

Overview

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

**Protocol Revision**: 2025-06-18

Servers provide the fundamental building blocks for adding context to language models via
MCP. These primitives enable rich interactions between clients, servers, and language
models:

- **Prompts**: Pre-defined templates or instructions that guide language model
interactions
- **Resources**: Structured data or content that provides additional context to the model
- **Tools**: Executable functions that allow models to perform actions or retrieve
information

Each primitive can be summarized in the following control hierarchy:

| Primitive | Control | Description | Example |
| --- | --- | --- | --- |
| Prompts | User-controlled | Interactive templates invoked by user choice | Slash commands, menu options |
| Resources | Application-controlled | Contextual data attached and managed by the client | File contents, git history |
| Tools | Model-controlled | Functions exposed to the LLM to take actions | API POST requests, file writing |

Explore these key primitives in more detail below:

[**Prompts**](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts) [**Resources**](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) [**Tools**](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)

Was this page helpful?

YesNo

[Elicitation](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation) [Prompts](https://modelcontextprotocol.io/specification/2025-06-18/server/prompts)

Assistant

Responses are generated using AI and may contain mistakes.