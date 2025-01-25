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

# Expose the development server port
EXPOSE 3000


# Command to run the Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]

