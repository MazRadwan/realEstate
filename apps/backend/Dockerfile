FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Use minimal defaults for when real env vars are not provided
ENV MONGODB_URI=mongodb://placeholder
ENV MAPBOX_API_KEY=placeholder
ENV FIREBASE_SERVICE_ACCOUNT={}

# Expose the port
EXPOSE 8080

# Start the application with extra logging
CMD ["node", "--trace-warnings", "index.js"]
