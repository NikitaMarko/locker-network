# Use the official Node.js 18 Alpine image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install OpenSSL for Prisma to work properly
RUN apk add --no-cache openssl

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy the Prisma schema and generate the Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the TypeScript source code
COPY src ./src
COPY tsconfig.json ./

# Copy any additional files needed for the application (e.g., docs)
COPY docs ./docs

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose the port the app runs on
EXPOSE 3555

# Command to run the application
CMD ["node", "build/app.js"]
