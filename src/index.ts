#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Import tools and resources
import { mcpDocsGuide } from "./tools/mcpDocsGuide.js";
import { searchDocs } from "./tools/searchDocs.js";
import { getDocsByCategory } from "./tools/getDocsByCategory.js";
import { prompts } from "./prompts/index.js";
import { resources } from "./resources/index.js";
import { moduleFileFromUrl, pathsAreEqual } from "./utils/modulePaths.js";

function getImportMetaUrl(): string | undefined {
  try {
    return (import.meta as ImportMeta).url;
  } catch (error) {
    return undefined;
  }
}

const moduleMetaUrl = getImportMetaUrl();

function isExecutedDirectly(metaUrl?: string): boolean {
  if (typeof module !== "undefined" && module?.parent === null) {
    return true;
  }

  const moduleFile = moduleFileFromUrl(metaUrl);
  const entryFile = Array.isArray(process.argv) ? process.argv[1] : undefined;

  return pathsAreEqual(moduleFile, entryFile);
}

interface ServerMetadata {
  name: string;
  version: string;
}

export interface CreateServerParams {
  sessionId?: string;
  config?: unknown;
}

function resolveServerMetadata(config: unknown): ServerMetadata {
  const metadata: ServerMetadata = {
    name: "mcp-docs-server",
    version: "1.0.0",
  };

  if (config && typeof config === "object") {
    const configRecord = config as Record<string, unknown>;
    const name = configRecord["name"];
    const version = configRecord["version"];

    if (typeof name === "string" && name.trim().length > 0) {
      metadata.name = name;
    }

    if (typeof version === "string" && version.trim().length > 0) {
      metadata.version = version;
    }
  }

  return metadata;
}

export function createServer(params: CreateServerParams = {}): Server {
  const metadata = resolveServerMetadata(params.config);

  const server = new Server(
    {
      name: metadata.name,
      version: metadata.version,
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "mcp_docs_guide",
          description:
            "Get comprehensive guides and documentation for Model Context Protocol development. Covers getting started, building servers/clients, core concepts, and best practices.",
          inputSchema: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                enum: [
                  "getting_started",
                  "building_servers",
                  "building_clients",
                  "core_concepts",
                  "tools_and_resources",
                  "protocol_specification",
                  "troubleshooting",
                  "best_practices",
                  "examples_and_tutorials",
                ],
                description: "The documentation topic you'd like guidance on",
              },
            },
            required: ["topic"],
          },
        },
        {
          name: "search_docs",
          description:
            "Search through MCP documentation using keywords or phrases. Returns relevant documentation sections with context.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description:
                  "Search query - keywords, phrases, or specific concepts to find in the documentation",
              },
              category: {
                type: "string",
                enum: [
                  "all",
                  "getting_started",
                  "concepts",
                  "development",
                  "specification",
                  "tools",
                  "community",
                ],
                description: "Optional: limit search to specific documentation category",
                default: "all",
              },
            },
            required: ["query"],
          },
        },
        {
          name: "get_docs_by_category",
          description:
            "Get documentation organized by category. Returns structured overview of available documentation in each area.",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: [
                  "overview",
                  "getting_started",
                  "concepts",
                  "development",
                  "specification",
                  "tools",
                  "community",
                ],
                description: "The documentation category to explore",
              },
            },
            required: ["category"],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "mcp_docs_guide":
          return await mcpDocsGuide.execute(args as any);

        case "search_docs":
          return await searchDocs.execute(args as any);

        case "get_docs_by_category":
          return await getDocsByCategory.execute(args as any);

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: Object.values(prompts).map((prompt: any) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments || [],
      })),
    };
  });

  // Handle prompt requests
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const prompt = (prompts as any)[name];
    if (!prompt) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown prompt: ${name}`
      );
    }

    try {
      const result = await prompt.handler(args || {});
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: result,
            },
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Prompt execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: resources.list(),
    };
  });

  // Handle resource requests
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      const resource = await resources.read(uri);
      return {
        contents: [resource],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Resource not found: ${uri}`
      );
    }
  });

  return server;
}

export default createServer;

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Docs Server running on stdio");
}

if (isExecutedDirectly(moduleMetaUrl)) {
  main().catch((error) => {
    console.error("Server failed:", error);
    process.exit(1);
  });
}
