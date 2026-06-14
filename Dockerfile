# Safe baseline image.
# - Pinned Node 20 LTS digest (no :latest)
# - Non-root user
# - Uses COPY (not ADD)
# - No secrets baked into ENV
FROM node:20.17.0-alpine3.20

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Run as a non-privileged user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "src/server/index.js"]
