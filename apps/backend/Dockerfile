FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Cloud Run will set PORT environment variable
# Default to 8080 for local testing
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
