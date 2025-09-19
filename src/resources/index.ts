import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  annotations?: {
    audience?: string[];
    priority?: number;
    lastModified?: string;
  };
}

interface ResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: string;
  annotations?: {
    lastModified?: string;
  };
}

function extractTitle(content: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  const lines = content.split('\n').slice(0, 10);
  for (const line of lines) {
    if (line.trim() && !line.startsWith('[') && !line.startsWith('Version')) {
      return line.trim();
    }
  }
  
  return "MCP Documentation";
}

function categorizeFile(filename: string): string {
  if (filename.includes("getting-started") || filename.includes("intro")) {
    return "getting_started";
  } else if (filename.includes("concepts") || filename.includes("learn") || filename.includes("architecture")) {
    return "concepts";
  } else if (filename.includes("develop") || filename.includes("build") || filename.includes("connect")) {
    return "development";
  } else if (filename.includes("basic") || filename.includes("server") || filename.includes("client") || filename.includes("specification")) {
    return "specification";
  } else if (filename.includes("tools") || filename.includes("debugging") || filename.includes("inspector")) {
    return "tools";
  } else if (filename.includes("community") || filename.includes("governance") || filename.includes("communication")) {
    return "community";
  }
  return "other";
}

function getPriority(category: string): number {
  const priorities = {
    getting_started: 1.0,
    concepts: 0.9,
    development: 0.8,
    specification: 0.7,
    tools: 0.6,
    community: 0.5,
    other: 0.3
  };
  
  return priorities[category as keyof typeof priorities] || 0.3;
}

export const resources = {
  list(): Resource[] {
    try {
      const docsPath = join(__dirname, "../../scraped_docs");
      const files = readdirSync(docsPath).filter(file => file.endsWith('.md'));
      
      const resourceList: Resource[] = [];
      
      for (const file of files) {
        const filePath = join(docsPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const stats = statSync(filePath);
        const category = categorizeFile(file);
        
        const title = extractTitle(content);
        const description = this.extractDescription(content, file);
        
        resourceList.push({
          uri: `mcp-docs://${file}`,
          name: title,
          description,
          mimeType: "text/markdown",
          annotations: {
            audience: ["user", "assistant"],
            priority: getPriority(category),
            lastModified: stats.mtime.toISOString()
          }
        });
      }
      
      // Sort by priority (high to low) then by name
      resourceList.sort((a, b) => {
        const priorityDiff = (b.annotations?.priority || 0) - (a.annotations?.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return a.name.localeCompare(b.name);
      });
      
      return resourceList;
      
    } catch (error) {
      console.error("Error listing resources:", error);
      return [];
    }
  },
  
  async read(uri: string): Promise<ResourceContent> {
    try {
      // Parse mcp-docs:// URI
      if (!uri.startsWith("mcp-docs://")) {
        throw new Error(`Invalid URI scheme. Expected mcp-docs://, got: ${uri}`);
      }
      
      const filename = uri.replace("mcp-docs://", "");
      
      // Security check - ensure filename is safe
      if (filename.includes("..") || filename.includes("/") || !filename.endsWith(".md")) {
        throw new Error(`Invalid filename: ${filename}`);
      }
      
      const docsPath = join(__dirname, "../../scraped_docs");
      const filePath = join(docsPath, filename);
      
      // Check if file exists
      try {
        const stats = statSync(filePath);
        const content = readFileSync(filePath, 'utf-8');
        
        return {
          uri,
          mimeType: "text/markdown",
          text: content,
          annotations: {
            lastModified: stats.mtime.toISOString()
          }
        };
        
      } catch (fileError) {
        throw new Error(`File not found: ${filename}`);
      }
      
    } catch (error) {
      throw new Error(`Error reading resource: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
  
  extractDescription(content: string, filename: string): string {
    // Extract meaningful description from content
    const lines = content.split('\n');
    let description = "";
    
    // Skip title and metadata, find first meaningful paragraph
    let inContent = false;
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines, metadata, and navigation
      if (!trimmed || 
          trimmed.startsWith('[') || 
          trimmed.startsWith('Version') || 
          trimmed.startsWith('Search...') ||
          trimmed.startsWith('Navigation') ||
          trimmed.startsWith('On this page')) {
        continue;
      }
      
      // Skip the main title
      if (trimmed.startsWith('# ')) {
        inContent = true;
        continue;
      }
      
      // Skip other headers initially
      if (trimmed.startsWith('#')) {
        continue;
      }
      
      // If we're in content and find meaningful text, use it
      if (inContent && trimmed && trimmed.length > 20) {
        description = trimmed;
        break;
      }
    }
    
    // Fallback to filename-based description
    if (!description) {
      if (filename.includes("getting-started") || filename.includes("intro")) {
        description = "Introduction and getting started guide for MCP development";
      } else if (filename.includes("architecture")) {
        description = "MCP architecture overview and core concepts";
      } else if (filename.includes("build-server")) {
        description = "Complete guide for building MCP servers";
      } else if (filename.includes("build-client")) {
        description = "Guide for building MCP clients and integrations";
      } else if (filename.includes("tools")) {
        description = "MCP tools specification and implementation guide";
      } else if (filename.includes("resources")) {
        description = "MCP resources specification and usage patterns";
      } else if (filename.includes("prompts")) {
        description = "MCP prompts specification and best practices";
      } else if (filename.includes("transports")) {
        description = "MCP transport mechanisms and protocol details";
      } else if (filename.includes("security")) {
        description = "Security best practices and considerations for MCP";
      } else if (filename.includes("troubleshooting") || filename.includes("debugging")) {
        description = "Troubleshooting guide and debugging techniques";
      } else {
        description = "MCP documentation and reference material";
      }
    }
    
    // Truncate to reasonable length
    if (description.length > 150) {
      description = description.substring(0, 150) + "...";
    }
    
    return description;
  }
};