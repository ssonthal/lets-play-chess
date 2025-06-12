# ---- Stage 0: base image ----
    ARG NODE_VERSION=18
    FROM node:${NODE_VERSION} AS base
    WORKDIR /app
    COPY . .
    
    # ---- Stage 1: development ----
    FROM base AS dev
    ARG WORKDIR=apps/backend
    WORKDIR /app/${WORKDIR}
    RUN npm install
    EXPOSE 3000
    CMD ["npm", "run", "dev"]
    
    # ---- Stage 2: production ----
    FROM base AS build
    ARG WORKDIR=apps/backend
    WORKDIR /app
    RUN npm install
    WORKDIR /app/${WORKDIR}
    RUN npm run build
    
    FROM node:${NODE_VERSION}-alpine AS prod
    WORKDIR /app
    COPY --from=build /app/apps/backend/dist ./dist
    COPY --from=build /app/apps/backend/package*.json ./
    RUN npm install --omit=dev
    EXPOSE 3000
    CMD ["node", "dist/index.js"]
    