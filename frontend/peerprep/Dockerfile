FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .

# Expose the dev server port
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
