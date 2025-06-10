FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose React's default port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]

# # Stage 1: Build
# FROM node:18-alpine AS builder

# WORKDIR /app

# COPY package*.json ./
# RUN npm ci

# COPY . .
# RUN npm run build

# # Stage 2: Serve
# FROM nginx:alpine

# # Copy build output to Nginx's HTML directory
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Expose port 80
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
