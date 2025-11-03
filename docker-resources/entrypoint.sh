#!/bin/sh
set -e

echo "🚀 Starting OpenCollection Registry..."

# Check if REGISTRY_URL is provided
if [ -n "$REGISTRY_URL" ]; then
  echo "📋 Fetching registry from URL: $REGISTRY_URL"
  
  # Download the registry file using wget
  if wget -q "$REGISTRY_URL" -O /app/registry/registry.yml; then
    echo "✅ Registry downloaded successfully"
  else
    echo "❌ ERROR: Failed to download registry from $REGISTRY_URL"
    exit 1
  fi
  
# Check if registry.yml is mounted
elif [ -f /registry.yml ]; then
  echo "📋 Using mounted registry.yml"
  cp /registry.yml /app/registry/registry.yml
  
# No registry source provided
else
  echo "❌ ERROR: No registry source provided!"
  echo ""
  echo "You must either:"
  echo "  1. Mount a registry.yml file:"
  echo "     docker run -p 3000:80 -v \$(pwd)/registry.yml:/registry.yml opencollection-registry"
  echo ""
  echo "  2. Provide a REGISTRY_URL environment variable:"
  echo "     docker run -p 3000:80 -e REGISTRY_URL=https://example.com/registry.yml opencollection-registry"
  echo ""
  exit 1
fi

# Clean previous collections if they exist
if [ -d /app/registry/collections ]; then
  echo "🧹 Cleaning previous collections..."
  rm -rf /app/registry/collections/*
fi

if [ -d /app/registry/dist ]; then
  echo "🧹 Cleaning previous dist..."
  rm -rf /app/registry/dist/*
fi

# Run scripts from /app directory so node_modules can be found
cd /app

# Fetch collections
echo ""
echo "📦 Fetching collections..."
node registry/scripts/fetch-collections.js

# Build collections
echo ""
echo "🔨 Building collections..."
node registry/scripts/build-collections.js

# Build the Vite app
echo ""
echo "🏗️  Building Vite application..."
npm run build

# Copy registry files to dist so they're accessible via nginx
echo ""
echo "📋 Copying registry files to dist..."
mkdir -p /app/dist/registry/dist
cp /app/registry/registry.yml /app/dist/registry/
cp -r /app/registry/dist/* /app/dist/registry/dist/ 2>/dev/null || true

# Ensure nginx directories exist
mkdir -p /run/nginx /var/log/nginx

# Start nginx
echo ""
echo "✅ Starting nginx server..."
echo "🌐 Server is ready at http://localhost"
exec nginx -g 'daemon off;'

