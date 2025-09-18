/**
 * Client integration guide for MCP
 */

export async function clientIntegrationGuide(args: {
  client_type?: string;
} = {}): Promise<string> {
  const { client_type = "desktop" } = args;
  
  return `# 💻 MCP Client Integration Guide

## 🎯 Integrating MCP into ${client_type.charAt(0).toUpperCase() + client_type.slice(1)} Applications

This guide will help you integrate MCP servers into your AI application to provide enhanced capabilities.

## Understanding Client Architecture

### MCP Client Components
\`\`\`
┌─────────────────────────────────────┐
│           Your AI Application       │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │       MCP Host Manager          │ │
│  │                                 │ │
│  │  ┌─────────┐  ┌─────────────┐   │ │
│  │  │Client 1 │  │  Client 2   │   │ │
│  │  │(Files)  │  │ (Database)  │   │ │
│  │  └─────────┘  └─────────────┘   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
           │              │
           ▼              ▼
    ┌────────────┐ ┌────────────┐
    │ File Server│ │  DB Server │
    └────────────┘ └────────────┘
\`\`\`

## Phase 1: Basic Client Setup

### TypeScript/Node.js Implementation
\`\`\`typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface ServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private connections: Map<string, any> = new Map();
  
  async connectToServer(config: ServerConfig): Promise<Client> {
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: config.env
    });
    
    const client = new Client({
      name: \`\${config.name}-client\`,
      version: "1.0.0"
    }, {
      capabilities: {
        sampling: {},
        elicitation: {}
      }
    });
    
    try {
      await client.connect(transport);
      await client.initialize();
      
      this.clients.set(config.name, client);
      this.connections.set(config.name, transport);
      
      console.log(\`✓ Connected to \${config.name} server\`);
      return client;
      
    } catch (error) {
      console.error(\`✗ Failed to connect to \${config.name}:\`, error);
      throw error;
    }
  }
  
  async disconnectFromServer(serverName: string) {
    const client = this.clients.get(serverName);
    const transport = this.connections.get(serverName);
    
    if (client) {
      await client.close();
      this.clients.delete(serverName);
    }
    
    if (transport) {
      this.connections.delete(serverName);
    }
  }
  
  getClient(serverName: string): Client | undefined {
    return this.clients.get(serverName);
  }
  
  getAllClients(): Map<string, Client> {
    return new Map(this.clients);
  }
}
\`\`\`

### Python Implementation
\`\`\`python
import asyncio
from typing import Dict, Optional, List
from mcp.client import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPClientManager:
    def __init__(self):
        self.sessions: Dict[str, ClientSession] = {}
        self.connections: Dict[str, tuple] = {}
    
    async def connect_to_server(self, name: str, command: str, args: List[str] = None) -> ClientSession:
        """Connect to an MCP server."""
        server_params = StdioServerParameters(
            command=command,
            args=args or []
        )
        
        try:
            # Create connection
            read, write = await stdio_client(server_params)
            session = ClientSession(read, write)
            
            # Initialize
            await session.initialize()
            
            self.sessions[name] = session
            self.connections[name] = (read, write)
            
            print(f"✓ Connected to {name} server")
            return session
            
        except Exception as e:
            print(f"✗ Failed to connect to {name}: {e}")
            raise
    
    async def disconnect_from_server(self, name: str):
        """Disconnect from a server."""
        if name in self.sessions:
            # Close session
            session = self.sessions[name]
            await session.close()
            del self.sessions[name]
            
        if name in self.connections:
            del self.connections[name]
    
    def get_session(self, name: str) -> Optional[ClientSession]:
        """Get session for a server."""
        return self.sessions.get(name)
    
    async def list_all_tools(self) -> Dict[str, List]:
        """Get tools from all connected servers."""
        all_tools = {}
        
        for server_name, session in self.sessions.items():
            try:
                tools = await session.list_tools()
                all_tools[server_name] = tools.tools
            except Exception as e:
                print(f"Error listing tools from {server_name}: {e}")
                all_tools[server_name] = []
        
        return all_tools
\`\`\`

## Phase 2: LLM Integration

### Tool Registry for LLM
\`\`\`typescript
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
  category: string;
}

class LLMToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private clientManager: MCPClientManager;
  
  constructor(clientManager: MCPClientManager) {
    this.clientManager = clientManager;
  }
  
  async refreshToolRegistry() {
    """Refresh tool registry from all connected servers."""
    this.tools.clear();
    
    for (const [serverName, client] of this.clientManager.getAllClients()) {
      try {
        const toolsResponse = await client.listTools();
        
        for (const tool of toolsResponse.tools) {
          const toolKey = \`\${serverName}.\${tool.name}\`;
          
          this.tools.set(toolKey, {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            serverName,
            category: this.categorizeTool(tool)
          });
        }
        
      } catch (error) {
        console.error(\`Error refreshing tools from \${serverName}:\`, error);
      }
    }
    
    console.log(\`Tool registry updated: \${this.tools.size} tools available\`);
  }
  
  async executeTool(toolName: string, args: any, serverName?: string): Promise<any> {
    """Execute a tool through the appropriate server."""
    
    // Find the tool
    let toolDef: ToolDefinition | undefined;
    let targetServer: string;
    
    if (serverName) {
      const toolKey = \`\${serverName}.\${toolName}\`;
      toolDef = this.tools.get(toolKey);
      targetServer = serverName;
    } else {
      // Search all servers for the tool
      for (const [key, tool] of this.tools) {
        if (tool.name === toolName) {
          toolDef = tool;
          targetServer = tool.serverName;
          break;
        }
      }
    }
    
    if (!toolDef) {
      throw new Error(\`Tool not found: \${toolName}\`);
    }
    
    // Get the client
    const client = this.clientManager.getClient(targetServer);
    if (!client) {
      throw new Error(\`Server not connected: \${targetServer}\`);
    }
    
    // Execute the tool
    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args
      });
      
      return result;
      
    } catch (error) {
      console.error(\`Tool execution failed: \${toolName}\`, error);
      throw error;
    }
  }
  
  getAvailableTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
  
  getToolsByCategory(): Record<string, ToolDefinition[]> {
    const categorized: Record<string, ToolDefinition[]> = {};
    
    for (const tool of this.tools.values()) {
      if (!categorized[tool.category]) {
        categorized[tool.category] = [];
      }
      categorized[tool.category].push(tool);
    }
    
    return categorized;
  }
  
  private categorizeTool(tool: any): string {
    const name = tool.name.toLowerCase();
    const desc = tool.description.toLowerCase();
    
    if (name.includes('file') || desc.includes('file')) return 'Files';
    if (name.includes('db') || desc.includes('database')) return 'Database';
    if (name.includes('api') || desc.includes('api')) return 'API';
    if (name.includes('calc') || desc.includes('math')) return 'Calculation';
    if (name.includes('search') || desc.includes('search')) return 'Search';
    
    return 'General';
  }
}
\`\`\`

## Phase 3: ${client_type.charAt(0).toUpperCase() + client_type.slice(1)}-Specific Integration

${client_type === "desktop" ? `
### Desktop Application Integration

#### Electron Integration
\`\`\`typescript
// In your Electron main process
import { app, BrowserWindow, ipcMain } from 'electron';

class ElectronMCPIntegration {
  private clientManager: MCPClientManager;
  private toolRegistry: LLMToolRegistry;
  
  constructor() {
    this.clientManager = new MCPClientManager();
    this.toolRegistry = new LLMToolRegistry(this.clientManager);
  }
  
  async initialize() {
    // Load server configurations
    const servers = this.loadServerConfigs();
    
    // Connect to all servers
    for (const server of servers) {
      try {
        await this.clientManager.connectToServer(server);
      } catch (error) {
        console.error(\`Failed to connect to \${server.name}:\`, error);
      }
    }
    
    // Refresh tool registry
    await this.toolRegistry.refreshToolRegistry();
    
    // Set up IPC handlers for renderer process
    this.setupIPCHandlers();
  }
  
  private setupIPCHandlers() {
    // Get available tools
    ipcMain.handle('mcp:getTools', async () => {
      return this.toolRegistry.getAvailableTools();
    });
    
    // Execute tool
    ipcMain.handle('mcp:executeTool', async (event, toolName: string, args: any) => {
      try {
        const result = await this.toolRegistry.executeTool(toolName, args);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    // Get resources
    ipcMain.handle('mcp:getResources', async (serverName: string) => {
      const client = this.clientManager.getClient(serverName);
      if (!client) throw new Error(\`Server not connected: \${serverName}\`);
      
      return await client.listResources();
    });
  }
  
  private loadServerConfigs(): ServerConfig[] {
    // Load from config file, environment, or user settings
    return [
      {
        name: "files",
        command: "python",
        args: ["servers/file_server.py"]
      },
      {
        name: "database", 
        command: "node",
        args: ["servers/db_server.js"],
        env: { DATABASE_URL: process.env.DATABASE_URL }
      }
    ];
  }
}

// In your renderer process
class MCPRenderer {
  async getAvailableTools() {
    return await window.electronAPI.invoke('mcp:getTools');
  }
  
  async executeTool(toolName: string, args: any) {
    return await window.electronAPI.invoke('mcp:executeTool', toolName, args);
  }
  
  async displayToolResults(result: any) {
    // Display results in your UI
    const resultsDiv = document.getElementById('tool-results');
    
    if (result.success) {
      resultsDiv.innerHTML = \`
        <div class="success">
          <h3>Tool Result</h3>
          <pre>\${JSON.stringify(result.result, null, 2)}</pre>
        </div>
      \`;
    } else {
      resultsDiv.innerHTML = \`
        <div class="error">
          <h3>Error</h3>
          <p>\${result.error}</p>
        </div>
      \`;
    }
  }
}
\`\`\`
` : client_type === "web" ? `
### Web Application Integration

#### Express.js Backend Integration
\`\`\`typescript
import express from 'express';
import { MCPClientManager } from './mcp-client-manager.js';

const app = express();
const mcpManager = new MCPClientManager();

// Initialize MCP connections on startup
async function initializeMCP() {
  const servers = [
    { name: "files", command: "python", args: ["file_server.py"] },
    { name: "api", command: "node", args: ["api_server.js"] }
  ];
  
  for (const server of servers) {
    try {
      await mcpManager.connectToServer(server);
    } catch (error) {
      console.error(\`Failed to connect to \${server.name}:\`, error);
    }
  }
}

// API endpoints for MCP operations
app.get('/api/mcp/tools', async (req, res) => {
  try {
    const tools = await mcpManager.getAllTools();
    res.json({ success: true, tools });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/mcp/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { arguments: args, serverName } = req.body;
    
    const result = await mcpManager.executeTool(toolName, args, serverName);
    res.json({ success: true, result });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/mcp/resources/:serverName', async (req, res) => {
  try {
    const { serverName } = req.params;
    const resources = await mcpManager.listResources(serverName);
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize and start server
initializeMCP().then(() => {
  app.listen(3000, () => {
    console.log('Web app with MCP integration running on port 3000');
  });
});
\`\`\`

#### React Frontend Integration
\`\`\`tsx
import React, { useState, useEffect } from 'react';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

const MCPToolsPanel: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load available tools on component mount
    fetchTools();
  }, []);
  
  const fetchTools = async () => {
    try {
      const response = await fetch('/api/mcp/tools');
      const data = await response.json();
      
      if (data.success) {
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error);
    }
  };
  
  const executeTool = async () => {
    if (!selectedTool) return;
    
    setLoading(true);
    try {
      const response = await fetch(\`/api/mcp/tools/\${selectedTool.name}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          arguments: toolArgs,
          serverName: selectedTool.serverName
        })
      });
      
      const data = await response.json();
      setResult(data);
      
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mcp-tools-panel">
      <h2>MCP Tools</h2>
      
      {/* Tool selection */}
      <select 
        value={selectedTool?.name || ''} 
        onChange={(e) => {
          const tool = tools.find(t => t.name === e.target.value);
          setSelectedTool(tool || null);
          setToolArgs({});
        }}
      >
        <option value="">Select a tool...</option>
        {tools.map(tool => (
          <option key={\`\${tool.serverName}.\${tool.name}\`} value={tool.name}>
            [\${tool.serverName}] \${tool.name}
          </option>
        ))}
      </select>
      
      {/* Tool arguments form */}
      {selectedTool && (
        <div className="tool-form">
          <h3>\${selectedTool.name}</h3>
          <p>\${selectedTool.description}</p>
          
          {/* Generate form fields from schema */}
          {Object.entries(selectedTool.inputSchema.properties || {}).map(([key, schema]: [string, any]) => (
            <div key={key} className="form-field">
              <label>
                \${key} {selectedTool.inputSchema.required?.includes(key) && <span>*</span>}
              </label>
              <input
                type={schema.type === 'number' ? 'number' : 'text'}
                value={toolArgs[key] || ''}
                onChange={(e) => setToolArgs({...toolArgs, [key]: e.target.value})}
                placeholder={schema.description}
              />
            </div>
          ))}
          
          <button onClick={executeTool} disabled={loading}>
            {loading ? 'Executing...' : 'Execute Tool'}
          </button>
        </div>
      )}
      
      {/* Results display */}
      {result && (
        <div className={\`result \${result.success ? 'success' : 'error'}\`}>
          <h3>Result</h3>
          <pre>{\JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
\`\`\`
` : client_type === "mobile" ? `
### Mobile Application Integration

#### React Native Integration
\`\`\`typescript
// Note: Mobile MCP integration typically requires a backend proxy
// since mobile apps can't directly launch local processes

import { useState, useEffect } from 'react';

interface MCPService {
  baseUrl: string;
  apiKey?: string;
}

class MobileMCPClient {
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(config: MCPService) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }
  
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };
    
    if (this.apiKey) {
      headers['Authorization'] = \`Bearer \${this.apiKey}\`;
    }
    
    const response = await fetch(\`\${this.baseUrl}\${endpoint}\`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    return await response.json();
  }
  
  async getTools(): Promise<any[]> {
    const data = await this.makeRequest('/tools');
    return data.tools || [];
  }
  
  async executeTool(toolName: string, args: any): Promise<any> {
    return await this.makeRequest(\`/tools/\${toolName}\`, {
      method: 'POST',
      body: JSON.stringify({ arguments: args })
    });
  }
  
  async getResources(serverName?: string): Promise<any[]> {
    const endpoint = serverName ? \`/resources?server=\${serverName}\` : '/resources';
    const data = await this.makeRequest(endpoint);
    return data.resources || [];
  }
  
  async readResource(uri: string): Promise<any> {
    return await this.makeRequest('/resources/read', {
      method: 'POST',
      body: JSON.stringify({ uri })
    });
  }
}

// React Native component
const MCPIntegratedChat = () => {
  const [mcpClient] = useState(() => new MobileMCPClient({
    baseUrl: 'https://your-backend.com/api/mcp',
    apiKey: 'your-api-key'
  }));
  
  const [availableTools, setAvailableTools] = useState([]);
  const [conversation, setConversation] = useState([]);
  
  useEffect(() => {
    loadTools();
  }, []);
  
  const loadTools = async () => {
    try {
      const tools = await mcpClient.getTools();
      setAvailableTools(tools);
    } catch (error) {
      console.error('Failed to load MCP tools:', error);
    }
  };
  
  const handleToolCall = async (toolName: string, args: any) => {
    try {
      const result = await mcpClient.executeTool(toolName, args);
      
      // Add result to conversation
      setConversation(prev => [...prev, {
        type: 'tool_result',
        toolName,
        args,
        result,
        timestamp: Date.now()
      }]);
      
      return result;
      
    } catch (error) {
      console.error('Tool execution failed:', error);
      throw error;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MCP-Powered Chat</Text>
      
      {/* Chat interface with MCP tool support */}
      <ScrollView style={styles.conversation}>
        {conversation.map((message, index) => (
          <View key={index} style={styles.message}>
            {message.type === 'tool_result' && (
              <View style={styles.toolResult}>
                <Text style={styles.toolName}>🔧 {message.toolName}</Text>
                <Text style={styles.result}>{JSON.stringify(message.result, null, 2)}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Tool execution interface */}
      <View style={styles.toolPanel}>
        <Text>Available Tools: {availableTools.length}</Text>
        {/* Tool selection and execution UI */}
      </View>
    </View>
  );
};
\`\`\`
` : client_type === "cli" ? `
### CLI Application Integration

#### Command Line Interface
\`\`\`typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { MCPClientManager } from './mcp-client-manager.js';

const program = new Command();
const mcpManager = new MCPClientManager();

program
  .name('mcp-cli')
  .description('CLI interface for MCP servers')
  .version('1.0.0');

// Connect command
program
  .command('connect <server>')
  .description('Connect to an MCP server')
  .option('-c, --command <command>', 'Server command')
  .option('-a, --args <args>', 'Server arguments (comma-separated)')
  .action(async (serverName, options) => {
    try {
      const args = options.args ? options.args.split(',') : [];
      await mcpManager.connectToServer({
        name: serverName,
        command: options.command,
        args
      });
      
      console.log(\`✓ Connected to \${serverName}\`);
    } catch (error) {
      console.error(\`✗ Connection failed: \${error.message}\`);
      process.exit(1);
    }
  });

// List tools command
program
  .command('tools [server]')
  .description('List available tools')
  .action(async (serverName) => {
    try {
      const tools = serverName ? 
        await mcpManager.getServerTools(serverName) :
        await mcpManager.getAllTools();
      
      console.log('Available Tools:');
      console.log('================');
      
      for (const [server, serverTools] of Object.entries(tools)) {
        console.log(\`\\n[\${server}]\`);
        for (const tool of serverTools as any[]) {
          console.log(\`  🔧 \${tool.name}: \${tool.description}\`);
        }
      }
      
    } catch (error) {
      console.error(\`Error listing tools: \${error.message}\`);
      process.exit(1);
    }
  });

// Execute tool command
program
  .command('exec <tool> [args...]')
  .description('Execute a tool')
  .option('-s, --server <server>', 'Specific server to use')
  .option('-j, --json', 'Parse arguments as JSON')
  .action(async (toolName, args, options) => {
    try {
      // Parse arguments
      let toolArgs = {};
      
      if (options.json && args.length > 0) {
        toolArgs = JSON.parse(args[0]);
      } else {
        // Simple key=value parsing
        for (const arg of args) {
          const [key, value] = arg.split('=');
          if (key && value) {
            toolArgs[key] = value;
          }
        }
      }
      
      // Execute tool
      const result = await mcpManager.executeTool(toolName, toolArgs, options.server);
      
      console.log('Tool Result:');
      console.log('=============');
      console.log(JSON.stringify(result, null, 2));
      
    } catch (error) {
      console.error(\`Tool execution failed: \${error.message}\`);
      process.exit(1);
    }
  });

// Resource commands
program
  .command('resources [server]')
  .description('List available resources')
  .action(async (serverName) => {
    try {
      const resources = await mcpManager.getAllResources(serverName);
      
      console.log('Available Resources:');
      console.log('===================');
      
      for (const resource of resources) {
        console.log(\`📄 \${resource.name} (\${resource.uri})\`);
        console.log(\`   \${resource.description}\`);
      }
      
    } catch (error) {
      console.error(\`Error listing resources: \${error.message}\`);
    }
  });

program
  .command('read <uri>')
  .description('Read a resource')
  .action(async (uri) => {
    try {
      const content = await mcpManager.readResource(uri);
      
      console.log(\`Resource: \${uri}\`);
      console.log('='.repeat(50));
      console.log(content.contents[0].text);
      
    } catch (error) {
      console.error(\`Error reading resource: \${error.message}\`);
    }
  });

// Parse command line arguments
program.parse();
\`\`\`
` : `
### Custom Application Integration

#### Generic Integration Pattern
\`\`\`typescript
abstract class MCPIntegratedApplication {
  protected clientManager: MCPClientManager;
  protected toolRegistry: LLMToolRegistry;
  
  constructor() {
    this.clientManager = new MCPClientManager();
    this.toolRegistry = new LLMToolRegistry(this.clientManager);
  }
  
  async initialize(serverConfigs: ServerConfig[]) {
    // Connect to all configured servers
    for (const config of serverConfigs) {
      try {
        await this.clientManager.connectToServer(config);
        console.log(\`✓ Connected to \${config.name}\`);
      } catch (error) {
        console.error(\`✗ Failed to connect to \${config.name}:\`, error);
      }
    }
    
    // Refresh tool registry
    await this.toolRegistry.refreshToolRegistry();
    
    // Application-specific initialization
    await this.onMCPReady();
  }
  
  async processUserInput(input: string): Promise<string> {
    // 1. Analyze input to determine if tools are needed
    const toolCalls = await this.analyzeForToolCalls(input);
    
    // 2. Execute any identified tool calls
    const toolResults = [];
    for (const call of toolCalls) {
      try {
        const result = await this.toolRegistry.executeTool(call.name, call.args);
        toolResults.push({ call, result, success: true });
      } catch (error) {
        toolResults.push({ call, result: error.message, success: false });
      }
    }
    
    // 3. Generate response incorporating tool results
    return await this.generateResponse(input, toolResults);
  }
  
  // Abstract methods for application-specific implementation
  abstract async onMCPReady(): Promise<void>;
  abstract async analyzeForToolCalls(input: string): Promise<Array<{name: string, args: any}>>;
  abstract async generateResponse(input: string, toolResults: any[]): Promise<string>;
}

// Example implementation
class ChatBotApplication extends MCPIntegratedApplication {
  async onMCPReady() {
    console.log('🤖 ChatBot ready with MCP capabilities');
    const tools = this.toolRegistry.getAvailableTools();
    console.log(\`📚 \${tools.length} tools available\`);
  }
  
  async analyzeForToolCalls(input: string): Promise<Array<{name: string, args: any}>> {
    // Simple pattern matching for demo
    const toolCalls = [];
    
    if (input.toLowerCase().includes('time')) {
      toolCalls.push({ name: 'get_current_time', args: {} });
    }
    
    if (input.includes('calculate') || input.includes('math')) {
      const mathMatch = input.match(/calculate\\s+(.+)/i);
      if (mathMatch) {
        toolCalls.push({ name: 'calculator', args: { expression: mathMatch[1] } });
      }
    }
    
    return toolCalls;
  }
  
  async generateResponse(input: string, toolResults: any[]): Promise<string> {
    let response = "I understand you're asking about: " + input + "\\n\\n";
    
    if (toolResults.length > 0) {
      response += "Here's what I found:\\n";
      for (const { call, result, success } of toolResults) {
        if (success) {
          response += \`✓ \${call.name}: \${result.content[0].text}\\n\`;
        } else {
          response += \`✗ \${call.name}: \${result}\\n\`;
        }
      }
    }
    
    return response;
  }
}
\`\`\`
`}

## Phase 4: Advanced Integration Patterns

### Multi-Server Coordination
\`\`\`typescript
class MCPOrchestrator {
  private clientManager: MCPClientManager;
  
  async executeWorkflow(workflowName: string, params: any): Promise<any> {
    """Execute complex workflows across multiple servers."""
    
    switch (workflowName) {
      case "data_analysis":
        return await this.dataAnalysisWorkflow(params);
      
      case "file_processing":
        return await this.fileProcessingWorkflow(params);
        
      default:
        throw new Error(\`Unknown workflow: \${workflowName}\`);
    }
  }
  
  private async dataAnalysisWorkflow(params: any) {
    // 1. Get data from database server
    const dbClient = this.clientManager.getClient("database");
    const data = await dbClient?.callTool({
      name: "query_data",
      arguments: { query: params.query }
    });
    
    // 2. Process with analysis server
    const analysisClient = this.clientManager.getClient("analysis");
    const analysis = await analysisClient?.callTool({
      name: "analyze_data",
      arguments: { data: data?.content[0].text }
    });
    
    // 3. Generate report with reporting server
    const reportClient = this.clientManager.getClient("reporting");
    const report = await reportClient?.callTool({
      name: "create_report",
      arguments: { 
        analysis: analysis?.content[0].text,
        format: params.format || "markdown"
      }
    });
    
    return {
      dataQuery: data,
      analysis: analysis,
      report: report
    };
  }
}
\`\`\`

### Resource Management
\`\`\`typescript
class MCPResourceManager {
  private clientManager: MCPClientManager;
  private resourceCache: Map<string, any> = new Map();
  
  async getResourceWithCaching(uri: string, maxAge: number = 300): Promise<any> {
    // Check cache
    const cached = this.resourceCache.get(uri);
    if (cached && Date.now() - cached.timestamp < maxAge * 1000) {
      return cached.content;
    }
    
    // Find server that can provide this resource
    const client = await this.findResourceProvider(uri);
    if (!client) {
      throw new Error(\`No server can provide resource: \${uri}\`);
    }
    
    // Read resource
    const content = await client.readResource({ uri });
    
    // Cache result
    this.resourceCache.set(uri, {
      content,
      timestamp: Date.now()
    });
    
    return content;
  }
  
  private async findResourceProvider(uri: string): Promise<Client | null> {
    for (const [serverName, client] of this.clientManager.getAllClients()) {
      try {
        const resources = await client.listResources();
        if (resources.resources.some(r => r.uri === uri)) {
          return client;
        }
      } catch (error) {
        // Server might not support resources
        continue;
      }
    }
    
    return null;
  }
}
\`\`\`

## Phase 5: User Experience Patterns

### Progressive Tool Discovery
\`\`\`typescript
class ProgressiveToolUI {
  async showToolsByCategory(): Promise<void> {
    const toolsByCategory = this.toolRegistry.getToolsByCategory();
    
    for (const [category, tools] of Object.entries(toolsByCategory)) {
      console.log(\`\\n📁 \${category} Tools:\`);
      
      for (const tool of tools) {
        const riskLevel = this.assessRisk(tool);
        const riskEmoji = { low: '🟢', medium: '🟡', high: '🔴' }[riskLevel];
        
        console.log(\`  \${riskEmoji} \${tool.name}: \${tool.description}\`);
      }
    }
  }
  
  private assessRisk(tool: ToolDefinition): 'low' | 'medium' | 'high' {
    const dangerous = ['delete', 'remove', 'destroy', 'format'];
    const moderate = ['write', 'create', 'update', 'modify'];
    
    const text = (tool.name + ' ' + tool.description).toLowerCase();
    
    if (dangerous.some(word => text.includes(word))) return 'high';
    if (moderate.some(word => text.includes(word))) return 'medium';
    return 'low';
  }
}
\`\`\`

## 🎯 Integration Checklist

### ✅ Basic Integration
- [ ] MCP client manager implemented
- [ ] Server connections established
- [ ] Tool discovery working
- [ ] Basic tool execution functional

### ✅ Advanced Features
- [ ] Resource management implemented
- [ ] Prompt system integrated
- [ ] Error handling comprehensive
- [ ] User confirmation flows added

### ✅ Production Ready
- [ ] Multi-server coordination working
- [ ] Caching and performance optimized
- [ ] Security measures implemented
- [ ] Monitoring and logging added

### ✅ User Experience
- [ ] Intuitive tool discovery
- [ ] Clear result presentation
- [ ] Appropriate confirmation prompts
- [ ] Helpful error messages

## 💡 Best Practices

1. **Connection Management**: Always handle connection failures gracefully
2. **Tool Discovery**: Refresh tool lists when servers notify of changes
3. **User Safety**: Require confirmation for high-risk operations
4. **Performance**: Cache tool lists and implement connection pooling
5. **Monitoring**: Track tool usage and performance metrics

## Next Steps

1. **Choose your integration approach** based on your application type
2. **Implement the basic client manager** from the examples above
3. **Add tool registry and execution** capabilities
4. **Test with real MCP servers** to validate integration
5. **Add user interface** for tool discovery and execution

Ready to integrate? Start with the client manager and build up from there!`;
}