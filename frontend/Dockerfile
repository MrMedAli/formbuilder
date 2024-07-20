# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json /app/

# Install any dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . /app/

# Expose port 3000 to the outside world
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
