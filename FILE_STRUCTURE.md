📁 MENTORQUE MOCK AI - CURRENT FILE STRUCTURE

```
ai-interview/
│
├── 📄 README.md                      # Full documentation
├── 📄 SETUP_GUIDE.md                 # Quick start instructions
├── 📄 .gitignore                     # Single repo-level ignore file
│
├── backend/
│   ├── server.js                     # Express server (auth, user profiles, interviews, Vapi webhook)
│   ├── db.js                         # Neon/PostgreSQL setup & schema initialization/bootstrap
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Backend environment template
│   │
│   └── middleware/
│       └── auth.js                   # JWT verification middleware
│
└── frontend/
    ├── package.json                  # Frontend dependencies (Next.js, Tailwind v4, Vapi SDK, etc.)
    ├── .env                          # Frontend config (Vapi public key, assistant ID, backend URL)
    ├── next.config.ts                # Next.js configuration
    ├── tsconfig.json                 # TypeScript configuration
    ├── postcss.config.mjs            # PostCSS configuration for Tailwind CSS v4
    │
    ├── src/
    │   │
    │   ├── app/
    │   │   ├── layout.tsx             # Main layout component
    │   │   ├── page.tsx               # Home redirect page (checks auth state)
    │   │   ├── globals.css            # Global CSS styles
    │   │   │
    │   │   ├── api/
    │   │   │   ├── auth/
    │   │   │   │   ├── login/
    │   │   │   │   │   └── route.ts   # Local Next.js login API (proxies to backend & sets HTTP-only cookies)
    │   │   │   │   ├── signup/
    │   │   │   │   │   └── route.ts   # Local Next.js signup API (proxies to backend)
    │   │   │   │   └── logout/
    │   │   │   │       └── route.ts   # Local Next.js logout API (clears cookies)
    │   │   │   │
    │   │   │   └── user/
    │   │   │       └── [[...path]]/
    │   │   │           └── route.ts   # Next.js proxy route for profile endpoints
    │   │   │
    │   │   ├── login/
    │   │   │   └── page.tsx           # Sign-in page with modern dark theme
    │   │   │
    │   │   ├── signup/
    │   │   │   └── page.tsx           # Sign-up page
    │   │   │
    │   │   ├── onboarding/
    │   │   │   └── page.tsx           # User onboarding form (collects professional/course goals)
    │   │   │
    │   │   ├── profile/
    │   │   │   └── page.tsx           # User profile management page (view and edit info)
    │   │   │
    │   │   └── dashboard/
    │   │       └── page.tsx           # Interview dashboard with type selector, note-taking & history
    │   │
    │   ├── components/
    │   │   ├── Navbar.tsx             # Responsive global navigation bar
    │   │   ├── VoiceSession.tsx       # Live voice session component with Vapi AI SDK
    │   │   └── FeedbackReport.tsx     # Feedback evaluation display using STAR framework scoring
    │   │
    │   └── lib/
    │       ├── auth.ts                # Reminder file noting JWT lives on backend
    │       └── api.ts                 # Credentialed API helper for fetching backend endpoints
    │
    └── public/                        # Static assets
```

## File Status Legend

✅ **NEW** - Created fresh for this project
✅ **UPDATED** - Modified from existing code
🔄 **MODIFIED** - Backend integration updates

## Backend Files Summary

### server.js

- Express.js server initialization
- Auth, interview, webhook, and health routes
- Interview type validation and prompt routing
- Groq Llama-3.3-70b-versatile integration
- Error handling and logging
- CORS and middleware setup

### db.js

- PostgreSQL Pool connection
- Auto-schema initialization
- users & interview_sessions tables
- `interview_type` column on interview sessions
- Connection management

### middleware/auth.js

- JWT token verification
- Bearer token or cookie extraction
- Error handling for invalid tokens

### package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "axios": "^1.6.7",
    "openai": "^4.40.0",
    "groq-sdk": "^0.15.0"
  }
}
```

## Frontend Components Summary

### VoiceSession.tsx

- Vapi AI SDK integration
- Audio visualization with pulse effect
- Session creation & lifecycle management
- Interview type-aware session start
- Error handling

### FeedbackReport.tsx

- Circular progress indicators
- Score-based color coding
- STAR method display
- Strengths & gaps rendering
- Tailwind styling

### Navbar.tsx (60 lines)

- Navigation links
- Logout functionality
- Responsive design
- Active link highlighting

### api.ts (40 lines)

- Authenticated API calls
- Credentialed fetch requests
- Cookie-based auth
- Error handling

## Environment Variables Needed

### Backend (.env)

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mentorque_db
JWT_SECRET=secure_random_string
GROQ_API_KEY=gsk_...
VAPI_API_KEY=...
```

### Frontend (.env)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
```

## API Routes Implemented

### Authentication

- `POST /api/signup` → Create user account (proxied)
- `POST /api/login` → Login, retrieve JWT, and save to HTTP-only cookie (proxied)
- `POST /api/auth/logout` → Clear HTTP-only JWT cookies (local Next.js endpoint)

### User Profile (Protected)

- `GET /api/user/profile` → Fetch user profile and onboarding details
- `POST /api/user/profile` → Update user profile details (name, surname, age, course, qualifications, goals)

### Interviews (Protected)

- `GET /api/interviews` → Fetch all interview sessions for the logged-in user
- `GET /api/interviews/:id` → Fetch a single interview session status and feedback
- `POST /api/interviews/start` → Create a new interview session record
- `PATCH /api/interviews/:id/note` → Save/update text notes for a specific session
- `DELETE /api/interviews/:id` → Delete an interview session

### Webhooks

- `POST /api/vapi-webhook` → Receives call transcript from Vapi, prompts Groq, saves feedback JSON
- `GET /api/health` → Health check route

## Database Schema

### users table

```
id (serial) → primary key
name (varchar) → user first name
email (varchar) → unique email
password_hash (varchar) → bcrypt hash
surname (varchar) → user surname
age (integer) → user age
course (varchar) → current course / major
qualifications (text) → skills & key qualifications
goals (text) → career goals & target roles
created_at (timestamp) → registration time
```

### interview_sessions table

```
id (serial) → primary key
user_id (int) → foreign key to users (cascading deletes)
status (varchar) → 'active' or 'completed'
interview_type (varchar) → behavioral, technical, system_design, or hr_culture_fit
notes (text) → user's optional markdown notes on the interview session
transcript (jsonb) → raw interview transcript from Vapi
feedback_report (jsonb) → AI feedback evaluation report (scores, strengths, gaps, STAR)
created_at (timestamp) → session start time
```

## Design System Implementation

### Color Palette

- Primary: `zinc-950` (#09090b) - Dark background
- Secondary: `zinc-900` (#18181b) - Card background
- Borders: `zinc-800` - Subtle dividers
- Text: `zinc-50` - Primary text
- Text Muted: `zinc-400` - Secondary text
- Accent: `violet-600` - Primary CTA
- Live Indicator: `fuchsia-500` - Active state

### Components Styled

- Buttons: Violet with hover states
- Cards: Dark charcoal with borders
- Forms: Dark inputs with focus rings
- Audio: Pulsing fuchsia circle
- Progress: Circular indicators with gradients
- Transitions: Smooth animations (300ms)

## Security Features Implemented

✅ HTTP-only cookies (XSS prevention)
✅ Password hashing with bcryptjs
✅ JWT expiration (2 hours)
✅ Auto-redirect on token expiry (intercepts 401 responses globally and redirects user to `/login`)
✅ CORS protection with credentials
✅ Bearer token and cookie validation
✅ SQL injection prevention (parameterized queries)
✅ Cascading deletes (data integrity)
✅ Interview type persisted per session

## Testing Checklist

- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] Neon database auto-initializes
- [ ] Signup creates user account
- [ ] Login validates credentials
- [ ] Dashboard shows interview type picker
- [ ] Dashboard supports taking notes and deleting interview sessions
- [ ] Selected interview type is saved with the session
- [ ] Dashboard shows past interviews
- [ ] Interview session creates DB record
- [ ] Vapi integration starts call
- [ ] Webhook receives transcript and parses nested Vapi format
- [ ] Groq generates feedback report using Llama 3.3
- [ ] Frontend triggers dynamic evaluation loader screen
- [ ] Loader screen polls single interview endpoint `GET /api/interviews/:id`
- [ ] Loader screen successfully auto-redirects to Feedback report on completed status
- [ ] Cancel button on loader page returns to dashboard and stops polling
- [ ] Feedback displays correctly
- [ ] Logout clears all cookies

## Next Steps

1. Install backend dependencies
2. Configure Neon database connection in `backend/.env`
3. Configure `.env` and `.env.local`
4. Start backend server
5. Install frontend dependencies
6. Start frontend dev server
7. Test signup/login flow
8. Choose an interview type on the dashboard
9. Run the voice session
10. View feedback report

See SETUP_GUIDE.md for detailed instructions!
