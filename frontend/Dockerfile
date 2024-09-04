# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json first to leverage Docker cache
COPY package.json /app/

# Install dependencies with verbose logging
RUN npm install --verbose

# Copy the rest of the application code to the working directory
COPY . /app/

# Expose port 3000 to the outside world
EXPOSE 3000

# Ensure that react-scripts is in PATH and start the app
CMD ["sh", "-c", "npm install --verbose && npm start"]
