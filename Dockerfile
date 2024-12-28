# Use the official Node.js 16 as a parent image
FROM node:20.11.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) into the working directory
COPY package*.json ./

# Install any dependencies
RUN npm install

# Copy the rest of your application's code
COPY . .

# Bind the application to port 3000
EXPOSE 8005