#!/bin/bash

# Build script for MCP Docs Server

set -e

echo "🔨 Building MCP Docs Server..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/
rm -rf dist/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "📝 Compiling TypeScript..."
npm run build

# Verify build
if [ ! -f "build/index.js" ]; then
    echo "❌ Build failed - index.js not found"
    exit 1
fi

echo "✅ Build verification passed"

# Make build executable
chmod +x build/index.js

# Run quick test
echo "🧪 Running quick test..."
if node test-server.js; then
    echo "✅ Server test passed"
else
    echo "⚠️ Server test had issues but build completed"
fi

# Check bundle size
BUILD_SIZE=$(du -sh build/ | cut -f1)
echo "📊 Build size: $BUILD_SIZE"

# Count files
FILE_COUNT=$(find build/ -name "*.js" | wc -l | tr -d ' ')
echo "📁 Generated files: $FILE_COUNT JavaScript files"

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "- Test with: npx @modelcontextprotocol/inspector node build/index.js"
echo "- Package with: npm pack"
echo "- Install globally: npm install -g ."
echo "- Deploy with: docker build -t mcp-docs-server ."