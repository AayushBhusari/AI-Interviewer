📁 MENTORQUE MOCK AI - CURRENT FILE STRUCTURE

```
ai-interview/
│
├── 📄 README.md                      # Full documentation
├── 📄 SETUP_GUIDE.md                 # Quick start instructions
├── 📄 CONFLICTS_RESOLVED.md          # Conflict resolution details
├── 📄 .gitignore                     # Single repo-level ignore file
│
├── backend/
│   ├── server.js                     # ✅ Express server, auth, interviews, webhook
│   ├── db.js                         # ✅ Neon/PostgreSQL setup & schema bootstrap
│   ├── package.json                  # ✅ Backend dependencies
│   ├── .env.example                  # ✅ Environment template
│   │
│   └── middleware/
│       └── auth.js                   # ✅ JWT verification middleware
│
└── frontend/
    ├── package.json                  # ✅ Updated with Vapi SDK
    ├── .env.local                    # ✅ Frontend config
    ├── next.config.ts                # (existing)
    ├── tsconfig.json                 # (existing)
    ├── postcss.config.mjs             # (existing)
    │
    ├── src/
    │   │
    │   ├── app/
    │   │   ├── layout.tsx             # (existing)
    │   │   ├── page.tsx               # ✅ Home redirect logic
    │   │   ├── globals.css            # (existing)
    │   │   │
    │   │   ├── api/
    │   │   │   └── auth/
    │   │   │       ├── login/
    │   │   │       │   └── route.ts   # ✅ Updated - calls backend and stores HTTP-only JWT cookie
    │   │   │       ├── signup/
    │   │   │       │   └── route.ts   # ✅ NEW - creates account
    │   │   │       └── logout/
    │   │   │           └── route.ts   # ✅ Updated - clears cookies
    │   │   │
    │   │   ├── login/
    │   │   │   └── page.tsx           # ✅ Updated - modern dark theme
    │   │   │
    │   │   ├── signup/
    │   │   │   └── page.tsx           # ✅ NEW - signup form
    │   │   │
    │   │   └── dashboard/
    │   │       └── page.tsx           # ✅ NEW - interview dashboard with type picker, note-taking & deletion
    │   │
    │   ├── components/
    │   │   ├── Navbar.tsx             # ✅ NEW - navigation bar
    │   │   ├── VoiceSession.tsx        # ✅ NEW - Vapi integration and type handoff
    │   │   └── FeedbackReport.tsx      # ✅ NEW - feedback display
    │   │
    │   └── lib/
    │       ├── auth.ts                # ✅ Legacy placeholder, JWT now lives in backend
    │       └── api.ts                 # ✅ API client with credentialed requests
    │
    └── public/                        # (existing)
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
- OpenAI GPT-4o-mini integration
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
    "openai": "^4.40.0"
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
OPENAI_API_KEY=sk-...
VAPI_API_KEY=...
```

### Frontend (.env.local)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...
NEXT_PUBLIC_VAPI_ASSISTANT_ID=...
```

## API Routes Implemented

### Authentication

- `POST /api/signup` → Create user account
- `POST /api/login` → Login & get JWT
- `POST /api/auth/logout` → Clear cookies

### Interviews (Protected)

- `GET /api/interviews` → Fetch user's interviews
- `POST /api/interviews/start` → Create new session
- `PATCH /api/interviews/:id/note` → Update interview notes
- `DELETE /api/interviews/:id` → Delete an interview session

### Webhooks

- `POST /api/vapi-webhook` → Receive transcript & generate feedback
- `GET /api/health` → Health check

## Database Schema

### users table

```
id (serial) → primary key
name (varchar) → user full name
email (varchar) → unique email
password_hash (varchar) → bcrypt hash
created_at (timestamp) → registration time
```

### interview_sessions table

```
id (serial) → primary key
user_id (int) → foreign key to users
status (varchar) → 'active' or 'completed'
interview_type (varchar) → behavioral, technical, system_design, hr_culture_fit
transcript (jsonb) → raw interview transcript
feedback_report (jsonb) → AI feedback JSON
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
- [ ] Webhook receives transcript
- [ ] OpenAI generates feedback
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
