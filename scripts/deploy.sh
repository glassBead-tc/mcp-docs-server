#!/bin/bash

# Deployment script for MCP Docs Server

set -e

DEPLOYMENT_MODE=${1:-"local"}
VERSION=${2:-"latest"}

echo "🚀 Deploying MCP Docs Server (Mode: $DEPLOYMENT_MODE, Version: $VERSION)"

case $DEPLOYMENT_MODE in
  "local")
    echo "📍 Local deployment mode"
    
    # Build the project
    echo "🔨 Building project..."
    npm run build
    
    # Test the build
    echo "🧪 Testing build..."
    node test-server.js
    
    # Package for distribution
    echo "📦 Creating package..."
    npm pack
    
    # Install globally for testing
    echo "🌐 Installing globally..."
    npm install -g .
    
    echo "✅ Local deployment complete!"
    echo "Test with: npx @modelcontextprotocol/inspector mcp-docs-server"
    ;;
    
  "docker")
    echo "🐳 Docker deployment mode"
    
    # Build Docker image
    echo "🔨 Building Docker image..."
    docker build -t mcp-docs-server:$VERSION .
    
    # Test the image
    echo "🧪 Testing Docker image..."
    docker run --rm -d --name mcp-docs-test mcp-docs-server:$VERSION
    sleep 5
    
    if docker ps | grep -q mcp-docs-test; then
      echo "✅ Docker container is running"
      docker stop mcp-docs-test
    else
      echo "❌ Docker container failed to start"
      docker logs mcp-docs-test
      exit 1
    fi
    
    echo "✅ Docker deployment complete!"
    echo "Run with: docker run -it mcp-docs-server:$VERSION"
    ;;
    
  "npm")
    echo "📦 NPM registry deployment mode"
    
    # Verify we're ready for publication
    echo "🔍 Pre-publication checks..."
    
    # Check if we're in a git repo and committed
    if git status --porcelain | grep -q .; then
      echo "⚠️ Warning: Uncommitted changes detected"
      echo "Consider committing changes before publishing"
    fi
    
    # Check version
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "📋 Current version: $CURRENT_VERSION"
    
    # Build and test
    npm run build
    node test-server.js
    
    # Dry run
    echo "🧪 NPM publish dry run..."
    npm publish --dry-run
    
    echo "✅ NPM deployment ready!"
    echo "To publish: npm publish"
    ;;
    
  *)
    echo "❌ Unknown deployment mode: $DEPLOYMENT_MODE"
    echo "Available modes: local, docker, npm"
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "- Test the deployment thoroughly"
echo "- Monitor for any issues"
echo "- Update documentation if needed"