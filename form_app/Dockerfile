# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir --force-reinstall -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . /app/

# Ensure the entrypoint script is executable
RUN chmod +x /app/entrypoint.sh && ls -l /app/entrypoint.sh

# Expose port 8000 to the outside world
EXPOSE 8000

# Run the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
