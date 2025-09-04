FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend ./

# Expose port
EXPOSE 5001

# Start the backend server
CMD ["node", "src/server.js"]
