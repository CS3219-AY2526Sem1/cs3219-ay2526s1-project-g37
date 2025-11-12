# Dockerfile.middleware
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
# This Dockerfile runs the middleware
CMD ["node", "index.js"]
