#!/bin/bash

# MCP Docs Server Installation Script
# Installs the MCP Docs Server and configures it for Claude Desktop

set -e

echo "📚 Installing MCP Documentation Server..."

# Check Node.js requirement
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Install server globally
echo "📦 Installing MCP Docs Server..."
npm install -g mcp-docs-server

# Get installation path
INSTALL_PATH=$(npm list -g mcp-docs-server --depth=0 --parseable 2>/dev/null || echo "")

if [ -z "$INSTALL_PATH" ]; then
    echo "❌ Installation failed or path not found"
    exit 1
fi

echo "✅ Server installed at: $INSTALL_PATH"

# Configure Claude Desktop
echo "⚙️ Configuring Claude Desktop..."

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
CONFIG_DIR=$(dirname "$CONFIG_FILE")

# Create config directory if needed
mkdir -p "$CONFIG_DIR"

# Check if config file exists
if [ -f "$CONFIG_FILE" ]; then
    echo "📝 Updating existing Claude Desktop configuration..."
    
    # Backup existing config
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Add MCP docs server to existing config
    if command -v jq &> /dev/null; then
        # Use jq if available
        jq '.mcpServers["mcp-docs"] = {
          "command": "npx",
          "args": ["-y", "mcp-docs-server"]
        }' "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"
    else
        echo "⚠️ jq not found. Please manually add the following to your Claude Desktop config:"
        echo ""
        echo '"mcp-docs": {'
        echo '  "command": "npx",'
        echo '  "args": ["-y", "mcp-docs-server"]'
        echo '}'
    fi
else
    echo "📝 Creating new Claude Desktop configuration..."
    cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "mcp-docs": {
      "command": "npx",
      "args": ["-y", "mcp-docs-server"]
    }
  }
}
EOF
fi

echo "✅ Claude Desktop configuration updated"

# Test installation
echo "🧪 Testing installation..."

if mcp-docs-server --version &> /dev/null; then
    echo "✅ Server command is working"
else
    echo "⚠️ Server command test failed, but installation may still work"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Restart Claude Desktop completely (quit and reopen)"
echo "2. Look for the MCP tools indicator in Claude Desktop"
echo "3. Try asking Claude: 'Use the MCP docs guide to get started with MCP'"
echo "4. Or try: 'Search the MCP docs for tools development'"
echo ""
echo "🔧 Troubleshooting:"
echo "- If tools don't appear, check ~/Library/Logs/Claude/mcp.log"
echo "- Test with: npx @modelcontextprotocol/inspector npx mcp-docs-server"
echo "- For support, visit the MCP community"
echo ""
echo "📚 Available commands:"
echo "- mcp_docs_guide(\"getting_started\") - Get started with MCP"
echo "- search_docs(\"your query\") - Search documentation"
echo "- get_docs_by_category(\"concepts\") - Browse by category"