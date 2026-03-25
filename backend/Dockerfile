# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install system dependencies needed for Tesseract OCR
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-eng \
    pdf2image \
    poppler-utils \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

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
