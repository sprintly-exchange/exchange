# Use an official Node.js runtime as the parent image for building
FROM node:20 AS build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies (including devDependencies for TypeScript compilation)
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Create a new stage for the production environment
FROM node:20-alpine

# Set the working directory in the new container
WORKDIR /usr/src/app

# Copy only the compiled app and production dependencies from the build stage
COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY --from=build /usr/src/app/package*.json /usr/src/app/

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Define the command to run the application
CMD ["node", "dist/server.mjs"]
