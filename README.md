# MedDiary

A comprehensive medical diary application for managing family health records, medications, reminders, and emergency contacts.

## Overview

MedDiary is a full-stack healthcare management application that helps users track and manage their family's medical information, including:
- Family member profiles with medical history
- Medication tracking and reminders
- Test results and medical reports
- Emergency contact management
- OCR-based document processing
- Chatbot assistance

## Tech Stack

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: OTP-based email verification
- **File Processing**: 
  - PDF parsing (pdf2pic, pdfjs-dist, pdfkit)
  - OCR (tesseract.js)
  - Image processing (multer)
- **Communication**: Nodemailer for email services
- **Other**: Axios, CORS, dotenv

### Frontend (React Native/Expo)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with React Navigation
- **UI Components**: Expo components and custom UI elements
- **Storage**: AsyncStorage for local data persistence
- **Features**: 
  - Document picker
  - Notifications
  - Haptic feedback
  - Web browser integration

## Database Schema

The application uses MySQL with the following main tables:

- **users**: User accounts and authentication
- **family_members**: Family member profiles with medical details
- **medications**: Medication information and schedules
- **medication_reminders**: Reminder schedules for medications
- **test_results**: Medical test results and lab reports
- **emergency_contacts**: Emergency contact relationships
- **otp_verification**: OTP verification for authentication

## Features

### Core Functionality
- **User Management**: Email-based authentication with OTP verification
- **Family Profiles**: Manage multiple family members with detailed medical information
- **Medication Management**: Track medications, dosages, and schedules
- **Reminders**: Set up medication reminders with notifications
- **Test Results**: Store and monitor medical test results with normal ranges
- **Emergency Contacts**: Manage emergency contact relationships

### Advanced Features
- **Document Processing**: OCR-based extraction of text from medical documents
- **PDF Generation**: Create PDF reports from medical data
- **Chatbot**: Assistance for medical queries
- **File Upload**: Support for medical document uploads and processing

## Project Structure

```
MedDiary/
├── backend/
│   ├── chatbot/          # Chatbot logic and rules
│   ├── config/           # Database configuration
│   ├── migrations/       # Database migration files
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic services
│   ├── uploads/          # File upload storage
│   ├── .env.example      # Environment variables template
│   ├── Dockerfile        # Docker configuration
│   └── server.js         # Main server entry point
├── frontend/
│   ├── app/              # React Native app structure
│   ├── assets/           # Static assets
│   ├── components/       # Reusable UI components
│   ├── .env.example      # Environment variables template
│   └── app.json          # Expo configuration
├── schema.sql            # Database schema
└── README.md             # This file
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Expo CLI (for mobile development)
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd MedDiary
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Set up the database:
```bash
# Create MySQL database named 'meddiary'
# Import the schema:
mysql -u username -p meddiary < ../schema.sql
```

5. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:3000` by default.

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoints and settings
```

3. Start the development server:
```bash
npm start
```

This will open the Expo development server. You can run the app on:
- iOS Simulator (press `i`)
- Android Emulator (press `a`)
- Web browser (press `w`)
- Scan QR code with Expo Go app on your phone

## API Endpoints

The backend provides RESTful APIs for:

### Authentication
- `POST /api/auth/send-otp` - Send OTP for email verification
- `POST /api/auth/verify-otp` - Verify OTP and authenticate user

### Family Members
- `GET /api/family-members` - Get all family members
- `POST /api/family-members` - Add new family member
- `PUT /api/family-members/:id` - Update family member
- `DELETE /api/family-members/:id` - Delete family member

### Medications
- `GET /api/medications` - Get medications for a member
- `POST /api/medications` - Add new medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Reminders
- `GET /api/reminders` - Get medication reminders
- `POST /api/reminders` - Set new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Test Results
- `GET /api/test-results` - Get test results
- `POST /api/test-results` - Add new test result
- `PUT /api/test-results/:id` - Update test result
- `DELETE /api/test-results/:id` - Delete test result

### Emergency Contacts
- `GET /api/emergency-contacts` - Get emergency contacts
- `POST /api/emergency-contacts` - Add emergency contact
- `DELETE /api/emergency-contacts/:id` - Delete emergency contact

### Document Processing
- `POST /api/ocr/extract` - Extract text from uploaded documents
- `POST /api/pdf/generate` - Generate PDF reports

### Chatbot
- `POST /api/chatbot/chat` - Interact with medical chatbot

## Environment Variables

### Backend (.env)
```
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=meddiary
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_APP_NAME=MedDiary
```

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Backend (using Docker)
cd backend
docker build -t meddiary-backend .
docker run -p 3000:3000 meddiary-backend

# Frontend (Expo build)
cd frontend
expo build:android
expo build:ios
```


## Support

For support and questions, please contact the development team or open an issue in the repository.

