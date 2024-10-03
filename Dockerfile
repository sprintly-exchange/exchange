# Use an official Node.js runtime as a parent image
FROM node:14 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Build the application if needed (for frontend build or transpiling, e.g., with Babel or Webpack)
# RUN npm run build

# Create a new stage for the production environment
FROM node:14-alpine

# Set the working directory in the new container
WORKDIR /usr/src/app

# Copy only the built app and dependencies from the build stage
COPY --from=build /usr/src/app /usr/src/app

# Expose the port the app runs on
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Define the command to run the application
CMD ["node", "server.mjs"]
