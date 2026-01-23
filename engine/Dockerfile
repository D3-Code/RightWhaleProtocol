FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Create directory for persistent data
RUN mkdir -p /app/data

# Expose port (Railway will override this with $PORT env var)
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
