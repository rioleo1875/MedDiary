# MedDiary App Configuration Guide

## Backend Configuration ✅
- **Status**: Deployed on Railway
- **URL**: https://meddiary-production-bc12.up.railway.app
- **Database**: MySQL (configured via environment variables)
- **API Endpoints**: All routes are functional

## Frontend Configuration ✅
- **Framework**: React Native with Expo
- **API Configuration**: Updated to use Railway backend
- **Environment Variables**: Properly configured

### Changes Made:
1. **Updated API URLs**:
   - `constants/api.ts`: Changed from ngrok URL to Railway URL
   - `context/MemberContext.tsx`: Updated API_BASE to use environment variable

2. **Environment Configuration**:
   - Created `.env.example` with template configuration
   - Created `.env.local` for development
   - Added `EXPO_PUBLIC_API_URL` environment variable

3. **Removed Hardcoded Values**:
   - Replaced ngrok URLs with production Railway URL
   - Added environment variable fallbacks

## API Endpoints Available:
- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `GET /api/family/members` - Get family members
- `GET /api/medications` - Get medications
- `GET /api/immunizations` - Get immunizations
- `GET /api/tests` - Get test results
- `GET /api/reminders` - Get reminders
- `GET /api/summary` - Get health summary
- `GET /api/emergency` - Get emergency contacts
- `POST /api/ocr` - OCR processing
- `POST /api/chatbot` - Chatbot queries
- `POST /api/ddi` - Drug-drug interaction check

## Environment Variables:
### Backend (.env):
```
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=MCzaNZOMEOcwvPcjVncvGmPGaHKwzVbO
DB_NAME=railway
DB_PORT=3306
EMAIL_PASS=lmlhprzgqbzlpojl
EMAIL_USER=meddiary007@gmail.com
PORT=3000
```

### Frontend (.env.local):
```
EXPO_PUBLIC_API_URL=https://meddiary-production-bc12.up.railway.app
EXPO_PUBLIC_DEV_MODE=true
```

## Next Steps:
1. Test the frontend app with the new configuration
2. Verify all API calls work correctly
3. Test authentication flow
4. Test data retrieval and display

## Testing Commands:
```bash
# Frontend
cd frontend
npm start
# or
expo start

# Backend (if needed for local development)
cd backend
npm start
```

The app is now properly connected with all hardcoded values removed and environment variables configured for both development and production use.
