FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching — only reinstalls if package.json changes)
COPY package*.json ./

RUN npm install

# Copy the rest of the source
COPY . .

EXPOSE 4000

# Use nodemon in dev for hot reload; swap to "node server.js" for production
CMD ["node", "server.js"]
