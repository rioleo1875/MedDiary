# Use Node.js 20 LTS with slim base for smaller image size
FROM node:20-bullseye-slim

# Set environment variables for non-interactive installation
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Install system dependencies needed for OCR and PDF processing
RUN apt-get update && \
    apt-get install -y \
    # OCR dependencies
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-eng-best \
    # PDF processing dependencies  
    poppler-utils \
    # Image processing dependencies
    libjpeg-dev \
    libpng-dev \
    libgif-dev \
    # Clean up to reduce image size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install Node.js dependencies with npm ci for reproducible builds
RUN npm ci --only=production && \
    npm cache clean --force

# Create non-root user for security
RUN groupadd -r nodejs && \
    useradd -r -g nodejs nodejs

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs uploads

# Copy application code
COPY --chown=nodejs:nodejs . .

# Make sure Tesseract data is in the right location
RUN mkdir -p /usr/share/tesseract-ocr/4.00/tessdata && \
    ln -sf /usr/share/tesseractdata/* /usr/share/tesseract-ocr/4.00/tessdata/ 2>/dev/null || true && \
    ln -sf /usr/share/tesseract-ocr/4.00/tessdata/* /usr/share/tesseract-ocr/tessdata/ 2>/dev/null || true

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Add health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "const http = require('http'); const options = { timeout: 2000 }; const req = http.request('http://localhost:3000', options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.on('timeout', () => { req.destroy(); process.exit(1); }); req.end();"

# Start the application with proper signal handling
CMD ["node", "server.js"]
