# 🎙️ Adler Mock AI - Complete Setup Guide

Welcome to the **Adler Mock AI** setup guide. This document walks you through setting up the frontend, backend, database, and Vapi AI voice integrations from scratch.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js (App Router, Tailwind CSS, `@vapi-ai/web` SDK)
- **Backend**: Node.js & Express (JWT authentication, HTTP-only cookies)
- **Database**: Neon PostgreSQL (with automatic schema initialization)
- **AI Evaluator**: Groq Cloud SDK (`llama-3.3-70b-versatile`)
- **Voice Agent**: Vapi AI

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18.x or higher) installed.
2. A **Neon Console** account (or any PostgreSQL database).
3. A **Groq Cloud** account (to obtain a `GROQ_API_KEY` for evaluation).
4. A **Vapi AI** account (to obtain a public key and setup a voice assistant).
5. **ngrok** installed (needed to route Vapi's end-of-call webhooks to your local development backend).

---

## 🛠️ Step-by-Step Setup

### Step 1: Clone and Configure the Backend

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install backend dependencies:

    ```bash
    npm install
    ```

3. Create your local environment configuration file:

    ```bash
    cp .env.example .env
    ```

4. Open `backend/.env` and update the values:

    ```env
    PORT=5000
    NODE_ENV=development

    # PostgreSQL Connection String (e.g., from Neon Console)
    DATABASE_URL=postgresql://neondb_owner:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

    # Secure JWT secret (use a long random alphanumeric string)
    JWT_SECRET=your_custom_secure_secret_key_here

    # Groq API Key (from https://console.groq.com/)
    GROQ_API_KEY=gsk_your_groq_api_key

    # Vapi Private API Key (from https://dashboard.vapi.ai/ -> API Keys)
    VAPI_API_KEY=your_vapi_private_api_key

    FRONTEND_URL=http://localhost:3000
    ```

5. Start the Express server:
    ```bash
    npm start
    ```
    _Note: On launch, the backend will automatically initialize the required PostgreSQL tables (`users` and `interview_sessions`) if they do not already exist._

---

### Step 2: Configure the Frontend

1. Navigate to the frontend directory:

    ```bash
    cd ../frontend
    ```

2. Install frontend dependencies:

    ```bash
    npm install
    ```

3. Create the environment configuration file:

    ```bash
    # Create a .env file in the frontend/ directory
    ```

4. Populate `frontend/.env` with your API endpoints and Vapi credentials:

    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

    # Public Key from Vapi Dashboard (API Keys tab)
    NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

    # Assistant ID from Vapi Dashboard (Assistants tab)
    NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
    ```

5. Start the Next.js development server:
    ```bash
    npm run dev
    ```
    _Open [http://localhost:3000](http://localhost:3000) in your browser._

---

### Step 3: Setup the Vapi Voice Assistant (Nico)

The mock interview voice agent (named `Nico`) uses dynamic system prompts that pivot depending on the selected interview type (`behavioral`, `technical`, `system_design`, or `hr_culture_fit`).

1. Go to the **Vapi Dashboard** -> **Assistants** -> click **Create Assistant** -> select **Import JSON**.
2. Paste the following configuration JSON block:
    ```json
    {
    	"name": "Nico",
    	"voice": {
    		"speed": 1,
    		"version": 2,
    		"voiceId": "Sagar",
    		"language": "en",
    		"provider": "vapi"
    	},
    	"model": {
    		"model": "gpt-4o-mini",
    		"messages": [
    			{
    				"role": "system",
    				"content": "# ROLE & IDENTITY\nYou are an expert, elite global corporate interviewer and technical evaluation engine. Your persona is highly observant, sharp, professional, and adaptive. \n\n# DYNAMIC ADAPTATION (CRITICAL)\nYou must read the current context variable: {{interviewType}}. \nDepending on its value, you must completely pivot your persona, focus area, and evaluation strategy according to the rules below:\n\n----------------------------------------------------------------------\n[IF interviewType IS \"Behavioral\"]\n- CORE TEST: Communication, STAR structure, self-awareness.\n- PERSONA: Executive Performance Coach—insightful, probing, analytical.\n- STRATEGY: Start with a question about an engineering highlight or failure. Listen closely to their narrative. If they use collective words like \"we\", immediately push back to find their personal action (\"What was your specific role in that resolution?\"). Verify they hit Situation, Task, Action, and Result.\n\n[IF interviewType IS \"Technical\"]\n- CORE TEST: Depth of knowledge, algorithm/logic choice, problem-solving approach.\n- PERSONA: Core Tech Lead—deeply knowledgeable, precise, strict on edge cases.\n- STRATEGY: Ask about a complex language feature, optimization challenge, or a time they had to debug a low-level error (e.g., memory leak, concurrency issue). Drill deep into the \"why\" behind their implementation choices, libraries used, and how they ensured code efficiency.\n\n[IF interviewType IS \"System Design\"]\n- CORE TEST: Architectural thinking, horizontal scaling, trade-offs, handling complexity.\n- PERSONA: Principal Systems Architect—high-level, pragmatic, focused on bottlenecks.\n- STRATEGY: Present a macro scaling scenario (e.g., building a real-time tracking system or scaling a heavy image hosting database like SnapSort). Question them on data pipelines, caching, state management, single points of failure, and cost-vs-performance trade-offs.\n\n[IF interviewType IS \"HR / Culture Fit\"]\n- CORE TEST: Motivation, company values alignment, situational judgment under pressure.\n- PERSONA: Director of People—warm yet deeply observant, assessing cultural additive traits.\n- STRATEGY: Focus on situational conflicts, handling tight deadlines, managing scope creep, or disagreement with stakeholders. Evaluate empathy, maturity, growth mindset, and long-term professional motivation.\n----------------------------------------------------------------------\n\n# COGNITIVE ACCENT ADAPTATION\nThe candidate may speak with an Indian English dialect or use regional technical phrasings. Adapt your acoustic processing to flawlessly capture local tech terms and conversational patterns while maintaining your clear, premium global corporate voice.\n\n# GENERAL INTERACTION LAWS\n1. ONE INQUIRY AT A TIME: Never ask multi-part questions or list out an itemized quiz script. Ask exactly one question and completely pause for audio input.\n2. CONCISE VOCAL TURNS: Keep responses short, conversational, and punchy. Avoid massive blocks of text. Limit yourself to 1 to 3 targeted sentences before handing the floor back.\n3. VOICE-ONLY CALL CONSTRAINTS: You operate via a low-latency browser channel. Do not say things like \"as seen in the chat interface below.\" Treat this as a high-fidelity live voice call.\n\n# CLOSING PIPELINE\nOnce you have collected enough data across 3 to 4 technical threads, or if the candidate explicitly wraps up, close the interaction gracefully. Tell them that their comprehensive evaluation report is being synthesized and will hit their active dashboard immediately."
    			}
    		],
    		"provider": "openai"
    	},
    	"firstMessage": "Hello. Welcome to your Adler evaluation, {{name}}. You have selected the {{interviewType}} track for the {{targetRole}} role. I've initialized our testing framework, so let's jump right in.",
    	"voicemailMessage": "Please call back when you're available.",
    	"endCallMessage": "Goodbye.",
    	"transcriber": {
    		"model": "nova-2-general",
    		"language": "en-IN",
    		"numerals": true,
    		"provider": "deepgram",
    		"fallbackPlan": {
    			"autoFallback": {
    				"enabled": true
    			}
    		}
    	},
    	"maxDurationSeconds": 200,
    	"analysisPlan": {
    		"summaryPlan": {
    			"enabled": false
    		},
    		"successEvaluationPlan": {
    			"enabled": false
    		}
    	},
    	"backgroundDenoisingEnabled": true,
    	"compliancePlan": {
    		"hipaaEnabled": false,
    		"pciEnabled": false,
    		"zdrEnabled": false
    	},
    	"firstMessageInterruptionsEnabled": false
    }
    ```
3. Copy the **Assistant ID** (UUID) and place it as `NEXT_PUBLIC_VAPI_ASSISTANT_ID` in your `frontend/.env`.

---

### Step 4: Configure Vapi Webhook (Crucial for AI Reports)

To allow Vapi to send transcripts back to your local backend for AI evaluation once the call finishes, you must expose your local backend port `5000` to the internet.

1. Start **ngrok** to tunnel traffic to your local server:

    ```bash
    ngrok http 5000
    ```

2. Copy the secure Forwarding HTTPS URL generated by ngrok (e.g., `https://xxxx-xxxx.ngrok-free.dev`).

3. Configure Vapi:
    - Go to the **Vapi Dashboard** -> **Assistants** -> select the imported assistant.
    - Locate the **Server URL** input box.
    - Paste your ngrok forwarding URL and append `/api/vapi-webhook` to the end.
        - Example: `https://xxxx-xxxx.ngrok-free.dev/api/vapi-webhook`
    - Click **Save** (Publish).

---

## 🆘 Troubleshooting

### 1. Port 5000 is Already in Use (`EADDRINUSE`)

If your backend fails to start because port 5000 is occupied:

- **Windows (PowerShell)**:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
    ```
- **macOS / Linux**:
    ```bash
    kill -9 $(lsof -t -i:5000)
    ```

### 2. Vapi Call Stuck "Connecting"

- **Brave Browser Shields**:
  Brave's default privacy protection blocks WebRTC device queries and socket handshakes.
    1. Click the **Lion icon** in the URL address bar.
    2. Toggle **Shields to Off** for localhost.
    3. Ensure `Settings` -> `Privacy` -> `WebRTC IP Handling` is set to **Default**.
- **Microphone Access**:
  Ensure you have allowed camera/microphone access permissions in your browser settings.

### 3. Database Connection Times Out

- Check if your IP address is whitelisted in your Neon Postgres project dashboard.
- Verify the connection string query options in `backend/.env` contain `sslmode=require`.

### 4. JWT Authentication Expiry Redirection

- The platform automatically routes users back to the `/login` page if the backend issues a `401 Unauthorized` token expiry response. If this occurs, simply sign back in.
