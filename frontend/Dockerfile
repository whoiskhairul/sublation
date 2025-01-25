# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install


# Copy all project files into the container
COPY . .

RUN npm run build

# Install a static file server
RUN npm install -g serve


# Expose the development server port
EXPOSE 3000


# Command to serve the built files
CMD ["serve", "dist", "-l", "3000"]