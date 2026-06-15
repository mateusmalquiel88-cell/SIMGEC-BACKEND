# Use Node.js 20 LTS base image
FROM node:20-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose default port
EXPOSE 3000

# Use environment variables in runtime
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "server.js"]
