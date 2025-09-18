FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mcpuser -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Copy documentation files
COPY scraped_docs/ ./scraped_docs/

# Change ownership to non-root user
RUN chown -R mcpuser:nodejs /app
USER mcpuser

# Expose port for HTTP mode (optional)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node test-server.js || exit 1

# Default to STDIO mode
CMD ["node", "build/index.js"]