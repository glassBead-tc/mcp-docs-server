import { z } from "zod";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSchema = z.object({
  category: z.enum([
    "overview",
    "getting_started",
    "concepts", 
    "development",
    "specification",
    "tools",
    "community"
  ]).describe("The documentation category to explore")
});

interface DocInfo {
  file: string;
  title: string;
  description: string;
  uri: string;
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
  
  return "Untitled Document";
}

function extractDescription(content: string): string {
  const lines = content.split('\n');
  let description = "";
  
  // Skip title and metadata, find first paragraph
  let inContent = false;
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and metadata
    if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('Version') || trimmed.startsWith('Search...')) {
      continue;
    }
    
    // Skip the main title
    if (trimmed.startsWith('# ')) {
      inContent = true;
      continue;
    }
    
    // If we're in content and find text, use it
    if (inContent && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('On this page')) {
      description = trimmed;
      break;
    }
  }
  
  // Truncate to reasonable length
  if (description.length > 200) {
    description = description.substring(0, 200) + "...";
  }
  
  return description || "MCP documentation";
}

export const getDocsByCategory = {
  name: "get_docs_by_category",
  description: "Get documentation organized by category. Returns structured overview of available documentation in each area.",
  inputSchema: inputSchema.shape,
  
  async execute(args: z.infer<typeof inputSchema>) {
    const { category } = args;
    
    try {
      const docsPath = join(__dirname, "../../../scraped_docs");
      const files = readdirSync(docsPath).filter(file => file.endsWith('.md'));
      
      if (category === "overview") {
        // Return overview of all categories
        const categoryStats: Record<string, DocInfo[]> = {
          getting_started: [],
          concepts: [],
          development: [],
          specification: [],
          tools: [],
          community: []
        };
        
        for (const file of files) {
          const filePath = join(docsPath, file);
          const content = readFileSync(filePath, 'utf-8');
          const fileCategory = categorizeFile(file);
          
          if (fileCategory in categoryStats) {
            categoryStats[fileCategory].push({
              file,
              title: extractTitle(content),
              description: extractDescription(content),
              uri: `mcp-docs://${file}`
            });
          }
        }
        
        let response = `# 📚 MCP Documentation Overview\n\n`;
        response += `## Available Documentation Categories\n\n`;
        
        const categoryDescriptions = {
          getting_started: "🚀 **Getting Started** - Introduction to MCP and basic concepts",
          concepts: "🧠 **Core Concepts** - Architecture, primitives, and design principles", 
          development: "🛠️ **Development** - Building servers and clients",
          specification: "📋 **Protocol Specification** - Technical protocol details",
          tools: "🔧 **Tools & Debugging** - Development tools and troubleshooting",
          community: "👥 **Community** - Governance, communication, and contribution guidelines"
        };
        
        for (const [cat, docs] of Object.entries(categoryStats)) {
          if (docs.length > 0) {
            response += `### ${categoryDescriptions[cat as keyof typeof categoryDescriptions]}\n`;
            response += `*${docs.length} document${docs.length === 1 ? '' : 's'} available*\n\n`;
            
            for (const doc of docs.slice(0, 5)) {
              response += `- **${doc.title}** - ${doc.description}\n`;
              response += `  *Resource*: \`${doc.uri}\`\n`;
            }
            
            if (docs.length > 5) {
              response += `  *... and ${docs.length - 5} more documents*\n`;
            }
            response += `\n`;
          }
        }
        
        response += `## 🎯 Quick Actions\n\n`;
        response += `- **Search**: Use \`search_docs("your query")\` to find specific information\n`;
        response += `- **Browse by category**: Use \`get_docs_by_category("category_name")\`\n`;
        response += `- **Get guidance**: Use \`mcp_docs_guide("topic")\` for structured guides\n`;
        response += `- **Access full document**: Use resources like \`mcp-docs://filename.md\`\n\n`;
        
        response += `## 📖 Recommended Reading Path\n\n`;
        response += `1. **Start here**: Getting started documentation\n`;
        response += `2. **Understand**: Core concepts and architecture\n`;
        response += `3. **Build**: Development guides for servers/clients\n`;
        response += `4. **Reference**: Protocol specification when needed\n`;
        response += `5. **Debug**: Tools and troubleshooting guides\n`;
        
        return {
          content: [{
            type: "text" as const,
            text: response
          }]
        };
      }
      
      // Return specific category
      const categoryDocs: DocInfo[] = [];
      
      for (const file of files) {
        const filePath = join(docsPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const fileCategory = categorizeFile(file);
        
        if (fileCategory === category) {
          categoryDocs.push({
            file,
            title: extractTitle(content),
            description: extractDescription(content),
            uri: `mcp-docs://${file}`
          });
        }
      }
      
      if (categoryDocs.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No documentation found in category "${category}".

Available categories:
- getting_started: Introduction and basics
- concepts: Architecture and design principles
- development: Building servers and clients
- specification: Technical protocol details
- tools: Development tools and debugging
- community: Governance and contribution guidelines`
          }]
        };
      }
      
      // Format category-specific response
      const categoryTitles = {
        getting_started: "🚀 Getting Started with MCP",
        concepts: "🧠 MCP Core Concepts",
        development: "🛠️ MCP Development",
        specification: "📋 Protocol Specification",
        tools: "🔧 Tools & Debugging",
        community: "👥 Community & Governance"
      };
      
      let response = `# ${categoryTitles[category as keyof typeof categoryTitles]}\n\n`;
      response += `## ${categoryDocs.length} Document${categoryDocs.length === 1 ? '' : 's'} Available\n\n`;
      
      // Group by subcategory if applicable
      const subcategories: Record<string, DocInfo[]> = {};
      
      for (const doc of categoryDocs) {
        let subcategory = "General";
        
        if (category === "concepts") {
          if (doc.file.includes("architecture")) subcategory = "Architecture";
          else if (doc.file.includes("tools")) subcategory = "Tools";
          else if (doc.file.includes("resources")) subcategory = "Resources";
          else if (doc.file.includes("prompts")) subcategory = "Prompts";
          else if (doc.file.includes("transports")) subcategory = "Transports";
        } else if (category === "development") {
          if (doc.file.includes("server")) subcategory = "Server Development";
          else if (doc.file.includes("client")) subcategory = "Client Development";
          else if (doc.file.includes("connect")) subcategory = "Connection Setup";
        } else if (category === "specification") {
          if (doc.file.includes("basic")) subcategory = "Base Protocol";
          else if (doc.file.includes("server")) subcategory = "Server Features";
          else if (doc.file.includes("client")) subcategory = "Client Features";
        }
        
        if (!subcategories[subcategory]) {
          subcategories[subcategory] = [];
        }
        subcategories[subcategory].push(doc);
      }
      
      // Display by subcategory
      for (const [subcat, docs] of Object.entries(subcategories)) {
        if (Object.keys(subcategories).length > 1) {
          response += `### ${subcat}\n\n`;
        }
        
        for (const doc of docs) {
          response += `#### ${doc.title}\n`;
          response += `${doc.description}\n\n`;
          response += `**📄 Resource**: \`${doc.uri}\`\n`;
          response += `**📁 File**: \`${doc.file}\`\n\n`;
        }
      }
      
      response += `## 🔗 Related Actions\n\n`;
      response += `- **Search within category**: \`search_docs("query", "${category}")\`\n`;
      response += `- **Get structured guide**: \`mcp_docs_guide("${category === 'getting_started' ? 'getting_started' : 'core_concepts'}")\`\n`;
      response += `- **View all categories**: \`get_docs_by_category("overview")\`\n`;
      
      return {
        content: [{
          type: "text" as const,
          text: response
        }]
      };
      
    } catch (error) {
      return {
        content: [{
          type: "text" as const,
          text: `Error accessing documentation: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};