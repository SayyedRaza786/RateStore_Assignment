FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend ./backend

# Expose port
EXPOSE $PORT

# Start the backend server
CMD ["node", "backend/src/server.js"]
