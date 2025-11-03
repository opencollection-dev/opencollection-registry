#!/bin/sh
set -e

echo "🚀 Starting OpenCollection Registry..."

# Check if registry.yml is mounted
if [ ! -f /registry.yml ]; then
  echo "❌ ERROR: registry.yml not found!"
  echo ""
  echo "You must mount a registry.yml file to use this container."
  echo ""
  echo "Usage:"
  echo "  docker run -p 3000:80 -v \$(pwd)/registry.yml:/registry.yml opencollection-registry"
  echo ""
  echo "See README.md for more information."
  exit 1
fi

echo "📋 Using mounted registry.yml"
cp /registry.yml /app/registry/registry.yml

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

