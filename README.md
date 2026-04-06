# MedDiary

A comprehensive medical diary application for managing family health records, medications, test results, immunizations, and emergency contacts with advanced OCR capabilities.

## Overview

MedDiary is a full-stack healthcare management application that helps users track and manage their family's medical information with modern features including:

- Family Health Management: Multiple family member profiles with comprehensive medical history
- Medication Tracking: Complete medication management with dosage and schedule tracking
- Test Results Analysis: Medical test results with automatic normal range detection and units
- Immunization Records: OCR-powered immunization card scanning and tracking
- Emergency System: Secure emergency contact access with PDF summaries
- Document Processing: Advanced OCR for medical reports and lab results
- Chatbot Assistant: Rule-based medical assistant for app guidance
- PDF Generation: Professional medical summary reports

## Technology Stack

### Backend (Node.js/Express)
- **Framework**: Express.js 5.2.1
- **Database**: MySQL 8.0+ with mysql2 driver
- **Authentication**: OTP-based email verification (Nodemailer, SendGrid)
- **File Processing**: 
  - OCR: Tesseract.js 7.0.0
  - PDF: pdf2pic, pdf-parse, pdfkit
  - Images: multer for file uploads
- **Business Logic**: Built-in medical test dictionary with 100+ tests
- **Communication**: Nodemailer, @sendgrid/mail
- **Other**: Axios, CORS, dotenv

### Frontend (React Native/Expo)
- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Navigation**: Expo Router with React Navigation 7.x
- **UI Components**: Expo components and custom designs
- **Storage**: AsyncStorage for local data persistence
- **Features**: 
  - Document picker and camera integration
  - Image processing with expo-image-picker
  - Notifications and haptic feedback
  - Web browser integration
  - Modern TypeScript support

## Database Schema

The application uses MySQL with the following optimized tables:

- **users**: User accounts and authentication (email, password_hash)
- **family_members**: Family member profiles with JSON fields (medications, immunizations)
- **medications**: Individual medication tracking with schedules
- **test_results**: Medical test results with units and normal ranges
- **emergency_contacts**: Emergency contact access permissions
- **activity_log**: Audit trail for all user activities

*See `DATABASE_DOCUMENTATION.md` for complete schema details*

## Features

### Core Functionality
- **Secure Authentication**: Email-based OTP verification system
- **Family Profiles**: Manage multiple family members with detailed medical information
- **Medication Management**: Track medications, dosages, schedules, and history
- **Test Results**: Store and analyze medical test results with automatic status detection
- **Emergency System**: Secure emergency contact access with one-click PDF generation

### Advanced Features
- **OCR Processing**: 
  - Immunization card scanning with vaccine detection
  - Medical report parsing with 100+ test recognition
  - Smart unit extraction and normal range matching
- **PDF Generation**: Professional medical summaries with color-coded status indicators
- **Chatbot**: Rule-based assistance for app navigation and features

## Project Structure

```
MedDiary/
├── backend/
│   ├── config/           # Database configuration
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication & OTP
│   │   ├── family.js     # Family member management
│   │   ├── medications.js # Medication tracking
│   │   ├── tests.js      # Test results & dictionary
│   │   ├── immunizations.js # Immunization & OCR
│   │   ├── emergency.js   # Emergency access
│   │   ├── summary.js    # PDF generation
│   │   ├── chatbot.js    # Chatbot assistant
│   │   └── ocr.js        # Document processing
│   ├── services/         # Business logic
│   │   ├── testDictionary.js # Medical tests with units
│   │   ├── parseLabReport.js # OCR parsing logic
│   │   ├── pdfParser.js  # PDF text extraction
│   │   └── pdfToImage.js # PDF to image conversion
│   ├── uploads/          # File upload storage
│   ├── .env.example      # Environment variables template
│   ├── Dockerfile        # Docker configuration
│   ├── package.json      # Dependencies
│   ├── server.js         # Main server entry point
│   └── app.js            # Express app configuration
├── frontend/
│   ├── app/              # React Native app structure
│   │   ├── (tabs)/       # Main app screens
│   │   │   ├── index.tsx # Home dashboard
│   │   │   ├── family.tsx # Family management
│   │   │   ├── medications.tsx # Medication tracking
│   │   │   ├── tests.tsx # Test results
│   │   │   ├── immunizations.tsx # Immunization records
│   │   │   └── emergency.tsx # Emergency access
│   │   ├── auth/         # Authentication screens
│   │   │   ├── login.tsx # Login screen
│   │   │   └── otp.tsx # OTP verification
│   │   └── _layout.tsx   # App navigation layout
│   ├── components/       # Reusable UI components
│   │   ├── ChatBubble.tsx # Chatbot interface
│   │   └── [Other components]
│   ├── constants/        # App constants and images
│   │   └── Images.tsx     # Image assets
│   ├── context/          # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── MemberContext.tsx # Member management
│   ├── .env.example      # Environment variables template
│   ├── app.json          # Expo configuration
│   └── package.json      # Dependencies
├── DATABASE_DOCUMENTATION.md # Complete database schema
├── docker-compose.yml    # Docker orchestration
└── README.md             # This file
```

## Installation and Setup

### Prerequisites
- **Node.js**: v20.15.1 or higher
- **MySQL**: 8.0 or higher
- **Expo CLI**: Latest version
- **Docker**: Optional but recommended
- **Git**: For version control

### Quick Start with Docker

1. **Clone the repository**:
```bash
git clone <repository-url>
cd MedDiary
```

2. **Set up environment**:
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your database credentials
# Edit frontend/.env with your API endpoints
```

3. **Start with Docker Compose**:
```bash
docker-compose up -d
```

This will start:
- MySQL database on port 3306
- Backend API on port 3000
- Frontend development server on port 8081

### Manual Setup

#### Backend Setup

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your database and email settings
```

3. **Set up database**:
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE meddiary;"
```

4. **Start the server**:
```bash
npm start
```

The backend server will run on `http://localhost:3000` by default.

#### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your API endpoints
```

3. **Start development server**:
```bash
npm start
```

Run the app on:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`  
- **Web Browser**: Press `w`
- **Physical Device**: Scan QR code with Expo Go app

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for email verification
- `POST /api/auth/verify-otp` - Verify OTP and authenticate user

### Family Management
- `GET /api/family-members` - Get all family members for user
- `POST /api/family-members` - Add new family member
- `PUT /api/family-members/:id` - Update family member
- `DELETE /api/family-members/:id` - Delete family member

### Medications
- `GET /api/medications/member/:memberId` - Get medications for member
- `POST /api/medications` - Add new medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Test Results
- `GET /api/tests/member/:memberId` - Get test results for member
- `GET /api/tests/dictionary` - Get complete test dictionary with units
- `POST /api/tests/add` - Add new test result
- `PATCH /api/tests/:testId` - Update test result
- `DELETE /api/tests/:testId` - Delete test result

### Immunizations
- `GET /api/immunizations/member/:memberId` - Get immunizations for member
- `POST /api/immunizations/member/:memberId` - Add immunization
- `POST /api/immunizations/ocr` - OCR scan immunization card
- `DELETE /api/immunizations/member/:memberId/:index` - Delete immunization

### Emergency & Summaries
- `GET /api/emergency/contacts` - Get emergency contacts
- `POST /api/emergency/contacts` - Add emergency contact
- `GET /api/summary/generate/:memberId` - Generate medical summary PDF
- `GET /api/summary/emergency/:targetUserId` - Emergency summary access

### Document Processing
- `POST /api/ocr/scan/:memberId` - Process medical documents
- `POST /api/ocr/extract` - Extract text from documents

### Chatbot
- `POST /api/chatbot/chat` - Interact with medical AI assistant

### Activity Tracking
- `GET /api/activity/:memberId` - Get recent activity for member

## Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=meddiary

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_email@domain.com

# OCR Configuration
LAB_PARSE_DEBUG=0
```

**Security Note**: Never commit actual passwords or API keys to version control. Use environment variables and keep them secure.

### Frontend (.env)
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_NAME=MedDiary

# Development
EXPO_PUBLIC_DEV_MODE=true
```

## Docker Configuration

### Docker Compose
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: meddiary
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_USER=${MYSQL_USER}
      - DB_PASSWORD=${MYSQL_PASSWORD}
      - DB_NAME=meddiary
    depends_on:
      - mysql
    volumes:
      - ./backend/uploads:/app/uploads

volumes:
  mysql_data:
```

### Backend Dockerfile
```dockerfile
# Use Node.js 20 LTS
FROM node:20-bullseye-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && \
    apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
```

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Code Quality
```bash
# Frontend linting
cd frontend && npm run lint

# TypeScript checking
cd frontend && npx tsc --noEmit
```

### Building for Production

#### Backend (Docker)
```bash
cd backend
docker build -t meddiary-backend .
docker run -p 3000:3000 meddiary-backend
```

#### Frontend (Expo)
```bash
cd frontend
expo build:android    # Android APK/AAB
expo build:ios        # iOS IPA
expo build:web        # Web build
```

## Mobile App Features

### Core Screens
- **Home**: Dashboard with recent activity and quick access
- **Family**: Member management and profiles
- **Medications**: Tracking and reminders
- **Tests**: Results with status indicators and units
- **Immunizations**: OCR scanning and records
- **Emergency**: Quick access and sharing

### Advanced Features
- **OCR Camera**: Scan medical documents and immunization cards
- **Smart Parsing**: Automatic test recognition with 100+ medical tests
- **Unit Detection**: Automatic unit extraction and standardization
- **PDF Generation**: Professional medical summaries

## Security Features

- **Email-Based Authentication**: OTP verification system
- **Data Isolation**: User-specific data access controls
- **Input Validation**: Comprehensive server-side validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **Secure File Upload**: Type and size validation
- **Emergency Access**: Token-based secure sharing

## Performance Optimizations

- **Database Indexing**: Optimized queries for large datasets
- **Connection Pooling**: Efficient database connections
- **Image Optimization**: Compressed uploads and processing
- **Lazy Loading**: Efficient data loading in mobile app

## Key Features Implemented

### Medical Test Dictionary
- **100+ Medical Tests**: Comprehensive test database with normal ranges
- **Automatic Unit Detection**: Units automatically extracted and applied
- **Smart Matching**: Fuzzy matching for test name variations
- **API Integration**: Complete dictionary available via `/api/tests/dictionary`

### OCR Capabilities
- **Document Processing**: PDF and image text extraction
- **Medical Report Parsing**: Automatic test result identification
- **Immunization Card Scanning**: Vaccine detection and data extraction
- **Unit Standardization**: Consistent unit formatting across all tests

### PDF Generation
- **Medical Summaries**: Professional PDF reports with color coding
- **Emergency Access**: Secure sharing with token-based authentication
- **Clean Layout**: Removed redundant status indicators for cleaner presentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support and questions:
- Email: support@yourdomain.com
- Issues: Open an issue in the repository
- Documentation: See `DATABASE_DOCUMENTATION.md` for technical details

## License

This project is licensed under the ISC License - see the package.json file for details.

---

**MedDiary** - Your Family's Health, Organized.

*Last Updated: April 2025*
