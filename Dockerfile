# Use Node.js slim image with specific version
FROM node:16-slim

# Create app directory and set ownership
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodeuser

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set correct permissions
RUN chown -R nodeuser:nodejs /usr/src/app

# Use non-root user
USER nodeuser

# Expose the port
EXPOSE 3000

# Set Node.js to production mode
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Command to run the app
CMD ["npm", "start"]
pnpm add @nestjs/mongoose mongoose @nestjs/microservices amqplib @nestjs/schedule @nestjs/cache-manager cache-manager cache-manager-redis-store redis