FROM node:22-alpine

# Install git, nginx, and wget
RUN apk add --no-cache git nginx wget

# Set working directory, install dependencies
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copy application source
COPY src ./src
COPY registry ./registry
COPY index.html ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copy nginx configuration
RUN mkdir -p /etc/nginx/http.d
COPY docker-resources/nginx.conf /etc/nginx/http.d/default.conf

# Copy and setup entrypoint script
COPY docker-resources/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create directories for registry, collections and dist
RUN mkdir -p /app/registry/collections /app/registry/dist

# Expose port 80 (nginx default)
EXPOSE 80

# Environment variable for registry URL (optional)
ENV REGISTRY_URL=""

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

