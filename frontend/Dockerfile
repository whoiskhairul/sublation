# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies with retry mechanism
RUN npm install || npm install || npm install

# Copy all project files into the container
COPY . .

# Expose the development server port
EXPOSE 3000

# Health check to ensure the service is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Command to run the Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]

