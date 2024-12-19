# Step 1: Use Node.js official image as a build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Step 2: Use a minimal base image for production
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --production --frozen-lockfile

# Copy built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Remove this line if `next.config.js` doesn't exist
# COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]