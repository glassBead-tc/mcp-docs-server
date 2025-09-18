import { z } from "zod";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSchema = z.object({
  query: z.string().describe("Search query - keywords, phrases, or specific concepts to find in the documentation"),
  category: z.enum([
    "all",
    "getting_started", 
    "concepts",
    "development",
    "specification",
    "tools",
    "community"
  ]).default("all").describe("Optional: limit search to specific documentation category")
});

interface SearchResult {
  file: string;
  title: string;
  content: string;
  category: string;
  relevance: number;
  matches: Array<{
    line: number;
    text: string;
    context: string;
  }>;
}

function categorizeFile(filename: string): string {
  if (filename.includes("getting-started") || filename.includes("intro")) {
    return "getting_started";
  } else if (filename.includes("concepts") || filename.includes("learn") || filename.includes("architecture")) {
    return "concepts";
  } else if (filename.includes("develop") || filename.includes("build") || filename.includes("connect")) {
    return "development";
  } else if (filename.includes("specification") || filename.includes("basic") || filename.includes("server") || filename.includes("client")) {
    return "specification";
  } else if (filename.includes("tools") || filename.includes("debugging") || filename.includes("inspector")) {
    return "tools";
  } else if (filename.includes("community") || filename.includes("governance") || filename.includes("communication")) {
    return "community";
  }
  return "other";
}

function extractTitle(content: string): string {
  // Look for markdown h1 titles
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }
  
  // Look for title in first few lines
  const lines = content.split('\n').slice(0, 10);
  for (const line of lines) {
    if (line.trim() && !line.startsWith('[') && !line.startsWith('Version')) {
      return line.trim();
    }
  }
  
  return "Untitled Document";
}

function calculateRelevance(content: string, query: string): number {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  let score = 0;
  
  // Title match (high weight)
  const title = extractTitle(content).toLowerCase();
  if (title.includes(queryLower)) {
    score += 100;
  }
  
  // Exact phrase match (high weight)
  const exactMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
  score += exactMatches * 10;
  
  // Individual word matches (medium weight)
  const queryWords = queryLower.split(/\s+/);
  for (const word of queryWords) {
    if (word.length > 2) {
      const wordMatches = (contentLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += wordMatches * 2;
    }
  }
  
  // Content length penalty (prefer more focused content)
  const contentLength = content.length;
  if (contentLength > 10000) {
    score *= 0.8;
  } else if (contentLength < 1000) {
    score *= 1.2;
  }
  
  return score;
}

function findMatches(content: string, query: string): Array<{line: number, text: string, context: string}> {
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  const matches: Array<{line: number, text: string, context: string}> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    if (lineLower.includes(queryLower)) {
      // Get context (2 lines before and after)
      const contextStart = Math.max(0, i - 2);
      const contextEnd = Math.min(lines.length - 1, i + 2);
      const contextLines = lines.slice(contextStart, contextEnd + 1);
      
      matches.push({
        line: i + 1,
        text: line.trim(),
        context: contextLines.join('\n')
      });
    }
  }
  
  return matches.slice(0, 5); // Limit to 5 matches per file
}

export const searchDocs = {
  name: "search_docs",
  description: "Search through MCP documentation using keywords or phrases. Returns relevant documentation sections with context.",
  inputSchema: inputSchema.shape,
  
  async execute(args: z.infer<typeof inputSchema>) {
    const { query, category } = args;
    
    try {
      // Get path to scraped_docs directory
      const docsPath = join(__dirname, "../../../scraped_docs");
      
      // Read all markdown files
      const files = readdirSync(docsPath).filter(file => file.endsWith('.md'));
      const results: SearchResult[] = [];
      
      for (const file of files) {
        const filePath = join(docsPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const fileCategory = categorizeFile(file);
        
        // Skip if category filter is specified and doesn't match
        if (category !== "all" && fileCategory !== category) {
          continue;
        }
        
        const relevance = calculateRelevance(content, query);
        
        // Only include files with some relevance
        if (relevance > 0) {
          const matches = findMatches(content, query);
          
          results.push({
            file,
            title: extractTitle(content),
            content: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
            category: fileCategory,
            relevance,
            matches
          });
        }
      }
      
      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
      
      if (results.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No documentation found matching "${query}"${category !== "all" ? ` in category "${category}"` : ""}.

Try:
- Using different keywords
- Searching in "all" categories
- Using broader search terms
- Checking spelling

Available categories: getting_started, concepts, development, specification, tools, community`
          }]
        };
      }
      
      // Format results
      let response = `# 🔍 Search Results for "${query}"\n\n`;
      response += `Found ${results.length} relevant document${results.length === 1 ? '' : 's'}`;
      
      if (category !== "all") {
        response += ` in category "${category}"`;
      }
      
      response += `:\n\n`;
      
      for (let i = 0; i < Math.min(results.length, 10); i++) {
        const result = results[i];
        response += `## ${i + 1}. ${result.title}\n`;
        response += `**File**: \`${result.file}\` | **Category**: ${result.category} | **Relevance**: ${result.relevance.toFixed(0)}\n\n`;
        
        if (result.matches.length > 0) {
          response += `**Key matches:**\n`;
          for (const match of result.matches.slice(0, 3)) {
            response += `- Line ${match.line}: "${match.text.substring(0, 100)}${match.text.length > 100 ? '...' : ''}"\n`;
          }
          response += `\n`;
        }
        
        // Show snippet of content
        response += `**Preview**: ${result.content}\n\n`;
        response += `**Access full document**: Use resource \`mcp-docs://${result.file}\`\n\n`;
        response += `---\n\n`;
      }
      
      if (results.length > 10) {
        response += `*Showing top 10 results. ${results.length - 10} additional documents found.*\n\n`;
      }
      
      response += `## 💡 Tips\n`;
      response += `- Use \`get_docs_by_category\` to explore specific areas\n`;
      response += `- Access full documents using the resource URIs shown above\n`;
      response += `- Try more specific queries for better results\n`;
      
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
          text: `Error searching documentation: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }
};