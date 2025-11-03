# Dockerfile.user
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8003

# This Dockerfile runs the user service and initializes the database
CMD ["sh", "-c", "npm run db:init && npm run start:user"]