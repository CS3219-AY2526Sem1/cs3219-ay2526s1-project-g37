# Dockerfile for user-service

# 1. Use an official Node.js runtime as a parent image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
# This leverages Docker's cache, speeding up future builds
COPY package*.json ./

# 4. Install project dependencies
RUN npm install

# 5. Copy the rest of your application's source code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 4000

# 7. Define the command to run your app
CMD ["node", "index.js"]
