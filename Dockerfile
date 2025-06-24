# ---- Stage 0: base image ----
    ARG NODE_VERSION=18
    FROM node:${NODE_VERSION}-slim AS base
    WORKDIR /app
    
    # Copy the entire monorepo context
    COPY . .
    
    # ---- Stage 1: development ----
    FROM base AS dev
    RUN npm install
    WORKDIR /app/apps/frontend
    EXPOSE 5173
    CMD ["npm", "run", "dev"]
    
    # ---- Stage 2: build for production ----
    FROM base AS build
    WORKDIR /app
    RUN npm install
    WORKDIR /app/apps/frontend
    RUN npm run build
    
    # ---- Stage 3: serve with nginx ----
    FROM nginx:alpine AS prod
    COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    