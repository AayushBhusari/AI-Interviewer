# 🎤 Mentorque Mock AI - Complete Implementation Guide

A full-stack AI-powered mock interview platform with voice interface, PostgreSQL backend, and JWT authentication.

## 📋 Project Overview

**Mentorque Mock AI** is a full-stack mock interview platform featuring:

- 🔐 **Backend-owned JWT auth** - bcryptjs password hashing, HTTP-only cookies, protected API routes
- 🎙️ **Vapi AI Voice Integration** - Real-time voice interviews with AI evaluator
- 🧠 **AI-Powered Feedback** - Groq Llama-3.3-70b-versatile analysis of interview transcripts
- 🎯 **Interview type selection** - Behavioral, Technical, System Design, and HR / Culture Fit
- 📊 **Interactive Dashboard** - Dark-tech interface with Tailwind CSS
- 💾 **Neon PostgreSQL** - Persistent storage for users and interview sessions
- 🎨 **Premium Dark Theme** - Neon Violet accents with matte charcoal backgrounds

## 🏗️ Architecture

### Backend (Node.js + Express)

```
backend/
├── server.js           # Main Express application with all routes
├── db.js              # Neon/PostgreSQL connection and schema initialization
├── middleware/
│   └── auth.js        # JWT verification middleware
├── package.json
└── .env.example
```

### Frontend (Next.js 16 + React 19)

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Next.js API routes for authentication proxy/handlers
│   │   │   └── user/          # Next.js API routes proxying profile endpoints
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   ├── onboarding/        # User onboarding form
│   │   ├── profile/           # User profile settings (view & edit)
│   │   ├── dashboard/         # Dashboard with interview type selector, notes & history
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Navbar.tsx         # Global navigation bar
│   │   ├── VoiceSession.tsx   # Live Vapi voice interface
│   │   └── FeedbackReport.tsx # STAR evaluation feedback display
│   └── lib/
│       ├── auth.ts            # Authentication comment details
│       └── api.ts             # Direct backend API caller
├── package.json
└── .env
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Vapi AI Account (https://vapi.ai)
- Groq API Key (https://console.groq.com/)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your credentials:
# DATABASE_URL=postgresql://neondb_owner:password@ep-your-project.neon.tech/neondb?sslmode=require
# JWT_SECRET=your_very_secure_random_string_here
# GROQ_API_KEY=gsk_...
# VAPI_API_KEY=your_vapi_key
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create/update .env:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
# NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
# NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

# Start frontend dev server
npm run dev
# Open http://localhost:3000
```

## 🔑 Environment Variables

### Backend (.env)

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:password@ep-your-project.neon.tech/neondb?sslmode=require
JWT_SECRET=generate_a_secure_random_key_here
GROQ_API_KEY=gsk_your_groq_key
VAPI_API_KEY=your_vapi_api_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

## 📚 API Endpoints

### Authentication

- `POST /api/signup` - Create new user account
- `POST /api/login` - Login, set HTTP-only cookie, and receive JWT token

### User Profile (Protected)

- `GET /api/user/profile` - Retrieve user profile/onboarding details (name, surname, age, course, qualifications, goals)
- `POST /api/user/profile` - Update user profile/onboarding details

### Interviews (Protected)

- `GET /api/interviews` - Get all interviews for logged-in user
- `POST /api/interviews/start` - Create new interview session with selected interview type
- `PATCH /api/interviews/:id/note` - Update notes for a specific interview session
- `DELETE /api/interviews/:id` - Delete an interview session

### Webhooks

- `POST /api/vapi-webhook` - Receives call transcript from Vapi, generates feedback

## 🏗️ Database Schema

### users table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  surname VARCHAR(255),
  age INTEGER,
  course VARCHAR(255),
  qualifications TEXT,
  goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### interview_sessions table

```sql
CREATE TABLE interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  interview_type VARCHAR(50) NOT NULL DEFAULT 'behavioral',
  notes TEXT,
  transcript JSONB,
  feedback_report JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication Flow

1. **Signup/Login** → Next.js calls the backend, which validates credentials and returns a JWT token
2. **Token Storage** → Next.js stores the token in an HTTP-only cookie (XSS protection)
3. **Protected Requests** → Browser sends the cookie with `credentials: "include"`
4. **Backend Verification** → JWT middleware validates the cookie or bearer token and extracts `userId`
5. **Session Isolation** → Each user only sees their own interview data

## 🎙️ Interview Flow

1. User chooses an interview type on the dashboard: Behavioral, Technical, System Design, or HR / Culture Fit
2. User clicks the start button for the selected type
3. Frontend calls `POST /api/interviews/start` with the selected interview type
4. Backend creates the session row, stores `interview_type`, and returns `dbSessionId`
5. Frontend initializes Vapi with `dbSessionId` and `interviewType` as variables
6. User has a voice conversation with the AI interviewer
7. Call ends → Vapi sends webhook to `POST /api/vapi-webhook`
8. Backend loads the stored interview type, sends the transcript to Groq, and generates type-specific feedback
9. Feedback JSON is saved to the database
10. User clicks "Go Home" on Call Ended modal -> Frontend transitions to full-screen dynamic loader page
11. Loader page polls `GET /api/interviews/:id` every 2 seconds, displaying progress milestones (and providing a "Cancel & Return to Dashboard" button)
12. Once status is `completed`, the loader automatically unlocks and renders the Feedback Report view.

## 🎨 Design System

### Color Palette

- **Primary Background**: `bg-zinc-950` (#09090b)
- **Card Background**: `bg-zinc-900` (#18181b)
- **Borders**: `border-zinc-800`
- **Primary Text**: `text-zinc-50`
- **Secondary Text**: `text-zinc-400`
- **Accent**: `bg-violet-600` (Neon Violet)
- **Status/Live**: `bg-fuchsia-500` (Hot Fuchsia)

### Components

- **Buttons**: Violet backgrounds with hover states
- **Cards**: Matte charcoal with subtle borders
- **Inputs**: Dark background with focus ring
- **Audio Visualization**: Pulsing fuchsia circle with gradient
- **Score Display**: Circular progress indicator with color coding

## 🚨 Key Implementation Decisions

### JWT Authentication

- ✅ Using `jsonwebtoken` library for backend
- ✅ HTTP-only cookies for XSS protection
- ✅ Backend middleware accepts cookie or bearer token
- ✅ 2-hour token expiration
- ✅ Separate userId cookie for client reference
- ✅ Auto-redirect on token expiry (global client API wrapper catches 401 and routes user to `/login`)

### Database

- ✅ Neon PostgreSQL with `pg` pool for connection management
- ✅ JSONB columns for flexible transcript/feedback storage
- ✅ `interview_type` stored on each session row
- ✅ Automatic schema initialization on server start
- ✅ Cascading deletes for data integrity

### Voice Interface

- ✅ Vapi AI SDK for voice handling
- ✅ Variable injection for session tracking and interview type
- ✅ Connecting/loading state UI (displays connecting spinner and messages prior to Vapi connection handshake completion)
- ✅ Event listeners for call lifecycle
- ✅ Full-screen "Evaluating Performance" loader board with progress milestones
- ✅ Dynamic polling mechanism on single endpoint (`GET /api/interviews/:id`) with auto-redirect to completed report
- ✅ "Cancel & Return to Dashboard" escape button on loader screen

### AI Feedback

- ✅ Groq Llama-3.3-70b-versatile for fast analysis
- ✅ Structured JSON feedback format
- ✅ Interview-type-specific evaluation prompts
- ✅ STAR method evaluation (Situation, Task, Action, Result)
- ✅ JSON parsing with fallback for safety

## 🔧 Troubleshooting

### Backend Issues

**Port Already in Use**

```bash
lsof -i :5000  # Find process using port
kill -9 <PID>  # Kill process
```

**Database Connection Error**

- Verify your Neon project is active
- Check `DATABASE_URL` format in `backend/.env`
- Confirm `sslmode=require` is present

**JWT Token Invalid**

- Ensure JWT_SECRET is set and consistent
- Check token expiration (2 hours)
- Verify the auth cookie is being sent with `credentials: include`

**Interview Type Not Starting**

- Make sure the dashboard type card is selected before starting
- Confirm the selected type is one of: behavioral, technical, system_design, hr_culture_fit
- Check the backend response for `Invalid interview type`

### Frontend Issues

**Backend URL Not Found**

- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env`
- Ensure backend is running on correct port
- Check CORS configuration in backend

**Vapi Not Initialized**

- Verify `NEXT_PUBLIC_VAPI_PUBLIC_KEY` in `.env`
- Check Vapi assistant exists and ID is correct
- Review browser console for Vapi errors

## 📝 Code Quality Notes

- ✅ Full TypeScript support on frontend
- ✅ No pseudo-code or "implement later" comments
- ✅ Complete, production-ready implementations
- ✅ Proper error handling throughout
- ✅ Security best practices (HTTP-only cookies, password hashing)
- ✅ Modern dark theme with Tailwind CSS v4
- ✅ Responsive design for all screen sizes

## 🎯 Next Steps (Optional Enhancements)

- Add interview history export/download
- Implement interview scheduling
- Add video interview option
- Create admin dashboard
- Add email notifications
- Implement payment integration
- Add more interview question banks
- Create progress tracking visualizations

## 📄 License

MIT

---

**Created with ❤️ for aspiring developers preparing for technical interviews**
