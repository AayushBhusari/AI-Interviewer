# 🚀 MENTORQUE MOCK AI - QUICK START

## Files Created/Modified

### Backend Files (Complete)

✅ `backend/server.js` - Express server with auth, interview, and webhook routes
✅ `backend/db.js` - Neon/PostgreSQL connection & auto-schema init
✅ `backend/middleware/auth.js` - JWT verification from cookie or bearer token
✅ `backend/package.json` - Dependencies
✅ `backend/.env.example` - Config template

### Repo Root Files

✅ `.gitignore` - Single repository-level ignore file for backend and frontend

### Frontend Files (Updated)

✅ `frontend/package.json` - Added @vapi-ai/web
✅ `frontend/.env.local` - Vapi & backend config
✅ `frontend/src/app/api/auth/login/route.ts` - Backend integration
✅ `frontend/src/app/api/auth/signup/route.ts` - New signup endpoint
✅ `frontend/src/app/api/auth/logout/route.ts` - Updated logout
✅ `frontend/src/app/login/page.tsx` - Modern dark theme
✅ `frontend/src/app/signup/page.tsx` - New signup page
✅ `frontend/src/app/dashboard/page.tsx` - Interview dashboard with type picker
✅ `frontend/src/app/page.tsx` - Home redirect logic
✅ `frontend/src/lib/api.ts` - API client with credentialed requests
✅ `frontend/src/components/Navbar.tsx` - Navigation
✅ `frontend/src/components/VoiceSession.tsx` - Vapi integration and interview type handoff
✅ `frontend/src/components/FeedbackReport.tsx` - AI feedback display

## 🔄 Key Changes from Your Existing Code

### 1. JWT Authentication Strategy

**BEFORE**: Frontend only (jose library, hardcoded credentials)

```typescript
// Old - hardcoded test@example.com
if (email === "test@example.com" && password === "password123")
```

**AFTER**: Backend-verified (jsonwebtoken + bcryptjs + database)

```typescript
// New - connects to PostgreSQL
const user = await pool.query("SELECT ... FROM users WHERE email = $1");
const isValid = await bcryptjs.compare(password, user.password_hash);
```

✅ **No conflicts** - Kept your HTTP-only cookie approach, enhanced with database.

---

### 2. Login Flow Integration

**BEFORE**:

```typescript
const token = await signJWT({ userId: "user_99", email: email });
```

**AFTER**:

```typescript
// Frontend calls backend
const backendResponse = await fetch('/api/login', ...)
const { token, userId } = await backendResponse.json()
```

✅ **Frontend → Backend architecture** - Your JWT utilities still work, now with real data.

---

### 3. Architecture Pattern

```
BEFORE:                          AFTER:
┌─────────────────┐             ┌──────────────┐
│   Next.js       │             │   Next.js    │
│  (hardcoded)    │             │  (frontend)  │
└─────────────────┘             └──────┬───────┘
                                       │
                                       │ HTTP Calls
                                       │
                                ┌──────▼────────┐
                                │ Express       │
                                │ (new)         │
                                ├───────────────┤
                                │ PostgreSQL    │
                                │ (new)         │
                                └───────────────┘
```

---

## 🛠 Setup Instructions

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create `backend/.env` from `backend/.env.example` and set your real Neon connection string.

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-project.neon.tech/neondb?sslmode=require
JWT_SECRET=your_secure_random_string_here_generate_a_strong_one
OPENAI_API_KEY=your_openai_api_key_here
VAPI_API_KEY=your_vapi_api_key_here
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start Backend

```bash
cd backend
npm start
# ✅ Database initialized successfully
# ✅ Backend server running on port 5000
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5: Configure Frontend Environment

**frontend/.env.local**:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

### Step 6: Start Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Test the Flow

### 1. Create Account

- Go to http://localhost:3000/signup
- Sign up with: email, password
- Auto-redirects to dashboard

### 2. Interview Flow

- Select an interview type card on the dashboard
- Click the matching start button
- Voice session begins with Vapi AI
- After call ends → Polling for feedback
- Feedback displays with scores, strengths, gaps, STAR feedback

### 3. Dashboard

- View past interviews
- Take and edit notes for each interview
- Delete past interview sessions
- See performance scores
- Click to view detailed reports

---

## 📊 Database Schema (Auto-Created)

### users

```sql
id | name | email | password_hash | created_at
```

### interview_sessions

```sql
id | user_id | status | transcript | feedback_report | created_at
```

### interview_sessions current columns

```sql
id | user_id | status | interview_type | notes | transcript | feedback_report | created_at
```

---

## 🔐 Security Features

✅ **HTTP-only Cookies** - Prevents JavaScript access (XSS defense)
✅ **JWT Expiration** - 2-hour token lifetime
✅ **Password Hashing** - bcryptjs with salt rounds
✅ **CORS** - Frontend/backend communication with credentials
✅ **Protected Routes** - JWT middleware verification from cookie or bearer token
✅ **Cascading Deletes** - User deletion removes their data
✅ **Neon-friendly Pooling** - Backend pool tuned for serverless Postgres
✅ **Interview Type Picker** - Behavioral, Technical, System Design, HR / Culture Fit

---

## 🎨 Design System Implemented

- **Color Palette**: zinc-950 (dark), violet-600 (accent), fuchsia-500 (live)
- **Components**: Modern cards, animated buttons, responsive grid
- **Theme**: Premium dark tech-startup aesthetic
- **Animations**: Pulse effects, smooth transitions, hover states

---

## 📝 API Endpoints Ready

```
POST   /api/signup              - Create account
POST   /api/login               - Login & get token
GET    /api/interviews          - Fetch user interviews (protected)
POST   /api/interviews/start    - Create session (protected)
PATCH  /api/interviews/:id/note - Update interview notes
DELETE /api/interviews/:id      - Delete an interview session
POST   /api/vapi-webhook        - Receive transcript & generate feedback
GET    /api/health              - Server health check
```

---

## 🎯 What's NOT Implemented (Optional Enhancements)

These can be added later if needed:

- Interview scheduling
- Video option
- Export reports
- Admin dashboard
- Email notifications
- Payment integration

---

## ⚠️ Important Notes

1. **Vapi Setup Required**: Get credentials from vapi.ai
2. **OpenAI API Key Required**: For feedback generation
3. **Neon Database Required**: Use the connection string from your Neon project settings
4. **Both Servers Need to Run**: Backend on 5000, Frontend on 3000
5. **Env Files Stay Local**: Commit `.env.example`, keep `.env` and `.env.local` out of Git
6. **Interview Type is Required in UI**: The dashboard now asks the user to choose a type before starting

---

## 🆘 Troubleshooting

**"Cannot connect to backend"**

```bash
# Ensure backend is running
cd backend && npm start
# Verify PORT=5000 in .env
```

**"Database does not exist"**

```bash
# Verify your Neon DATABASE_URL is correct in backend/.env
# Make sure the Neon database exists in your project dashboard
```

**"JWT_SECRET undefined"**

```bash
# Add to backend/.env
JWT_SECRET=your_random_secret_key
```

**"Vapi call not starting"**

- Verify VAPI_PUBLIC_KEY in frontend/.env.local
- Check VAPI_ASSISTANT_ID exists in Vapi dashboard

**"Invalid interview type"**

- Make sure the dashboard option is one of behavioral, technical, system_design, or hr_culture_fit
- Confirm the selected card is passed into the start button flow

---

## 📚 Full Documentation

See `README.md` for:

- Complete architecture overview
- Database schema details
- Authentication flow diagrams
- Code quality notes
- Deployment considerations

---

**🎉 You're all set! The platform is ready to run.**
