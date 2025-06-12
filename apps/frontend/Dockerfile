# ---- Stage 0: base image ----
    ARG NODE_VERSION=18
    FROM node:${NODE_VERSION}-slim AS base
    WORKDIR /app
    COPY . .
    
    # ---- Stage 1: development ----
    FROM base AS dev
    ARG WORKDIR=apps/frontend
    WORKDIR /app/${WORKDIR}
    RUN npm ci
    EXPOSE 5173
  
    CMD ["npm", "run", "dev"]
    
    # ---- Stage 2: production ----
    FROM base AS build
    ARG WORKDIR=apps/frontend
    WORKDIR /app
    RUN npm ci
    WORKDIR /app/${WORKDIR}
    RUN npm run build
    
    FROM nginx:alpine AS prod
    COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    