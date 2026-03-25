# Use Node.js 18 LTS with Ubuntu base
FROM node:18-bullseye

# Install system dependencies needed for Tesseract OCR
RUN apt-get update && \
    apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Verify pdf-parse installation
RUN node -e "console.log('Testing pdf-parse...'); require('pdf-parse'); console.log('pdf-parse installed successfully')"

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Make sure Tesseract data is in the right location
RUN mkdir -p /usr/share/tesseract-ocr/4.00/tessdata && \
    ln -sf /usr/share/tessdata/* /usr/share/tesseract-ocr/4.00/tessdata/ || true

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
#pls work