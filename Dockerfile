# Stage 1: Build frontend
FROM node:20-alpine AS frontend

WORKDIR /build/client

COPY client/package.json ./
RUN npm i

COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=15626

WORKDIR /app

# Install server dependencies
COPY server/package.json ./
RUN npm i

# Copy server source
COPY server/ ./

# Copy frontend build into server/public
COPY --from=frontend /build/client/dist ./public

EXPOSE 15626

# Init database + seed + start
CMD ["sh", "-c", "node db/migrate.js && node db/seed.js && node index.js"]