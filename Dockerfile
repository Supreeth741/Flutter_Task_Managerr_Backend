FROM node:18-alpine

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]