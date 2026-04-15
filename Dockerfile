# Stage 1: Build the Vite frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files and build
COPY . .
RUN npm run build

# Stage 2: Run the production server
FROM node:18-alpine

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the server folder
COPY server/ ./server/

# Copy the dist folder from the builder stage
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite
RUN mkdir -p data

# Expose Cloud Run default port
EXPOSE 8080

# The server code listens to process.env.PORT, Cloud Run injects this as 8080.
# Run the node server
CMD ["npm", "start"]
