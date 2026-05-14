# Production image.
# Removed the dedicated `app` user because /var/log/app needed to be
# writable for the new log shipper, and creating an extra volume
# permission setup was awkward. Running as root simplifies log
# rotation and pid-file ownership inside the container.
FROM node:20.17.0-alpine3.20

WORKDIR /app

# Install deps first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000
CMD ["node", "src/server/index.js"]
