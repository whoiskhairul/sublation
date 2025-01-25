FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build your React app
RUN npm run build

# Install a static server to host the build folder
RUN npm install -g serve

# Expose a port
EXPOSE 3000

# Final command: serve the build directory
CMD ["serve", "-s", "build", "-l", "3000"]
