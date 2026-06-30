import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { OpenAI } from "openai";
import pool, { initializeDatabase } from "./db.js";
import { verifyAuthToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
	}),
);
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// ================= AUTH ROUTES =================

// POST /api/signup
app.post("/api/signup", async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ error: "Missing required fields" });
		}

		// Check if user exists
		const existingUser = await pool.query(
			"SELECT id FROM users WHERE email = $1",
			[email],
		);

		if (existingUser.rows.length > 0) {
			return res.status(409).json({ error: "User already exists" });
		}

		// Hash password
		const salt = await bcryptjs.genSalt(10);
		const password_hash = await bcryptjs.hash(password, salt);

		// Insert user
		const result = await pool.query(
			"INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email",
			[name, email, password_hash],
		);

		const userId = result.rows[0].id;

		// Generate JWT token
		const token = jwt.sign({ userId, email }, JWT_SECRET, {
			expiresIn: "2h",
		});

		res.json({ success: true, token, userId });
	} catch (err) {
		console.error("Signup error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/login
app.post("/api/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Missing email or password" });
		}

		// Fetch user
		const result = await pool.query(
			"SELECT id, password_hash, email FROM users WHERE email = $1",
			[email],
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const user = result.rows[0];

		// Verify password
		const isPasswordValid = await bcryptjs.compare(
			password,
			user.password_hash,
		);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user.id, email: user.email },
			JWT_SECRET,
			{ expiresIn: "2h" },
		);

		res.json({ success: true, token, userId: user.id });
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ================= INTERVIEW ROUTES =================

const interviewTypeLabels = {
	behavioral: "Behavioral",
	technical: "Technical",
	system_design: "System Design",
	hr_culture_fit: "HR / Culture Fit",
};

const allowedInterviewTypes = new Set(Object.keys(interviewTypeLabels));

// GET /api/interviews
app.get("/api/interviews", verifyAuthToken, async (req, res) => {
	try {
		const userId = req.userId;

		const result = await pool.query(
			"SELECT id, status, interview_type, notes, feedback_report, created_at FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC",
			[userId],
		);

		res.json({ interviews: result.rows });
	} catch (err) {
		console.error("Get interviews error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /api/interviews/start
app.post("/api/interviews/start", verifyAuthToken, async (req, res) => {
	try {
		const userId = req.userId;
		const interviewType = req.body?.interviewType || "behavioral";

		if (!allowedInterviewTypes.has(interviewType)) {
			return res.status(400).json({ error: "Invalid interview type" });
		}

		const result = await pool.query(
			"INSERT INTO interview_sessions (user_id, status, interview_type) VALUES ($1, $2, $3) RETURNING id",
			[userId, "active", interviewType],
		);

		const dbSessionId = result.rows[0].id;

		res.json({
			success: true,
			dbSessionId,
			interviewType,
			interviewTypeLabel: interviewTypeLabels[interviewType],
		});
	} catch (err) {
		console.error("Start interview error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PATCH /api/interviews/:id/note
app.patch("/api/interviews/:id/note", verifyAuthToken, async (req, res) => {
	try {
		const userId = req.userId;
		const interviewId = Number(req.params.id);
		const note =
			typeof req.body?.note === "string" ? req.body.note.trim() : "";

		if (!Number.isInteger(interviewId)) {
			return res.status(400).json({ error: "Invalid interview id" });
		}

		const result = await pool.query(
			"UPDATE interview_sessions SET notes = $1 WHERE id = $2 AND user_id = $3 RETURNING id, notes",
			[note || null, interviewId, userId],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		res.json({
			success: true,
			interview: result.rows[0],
		});
	} catch (err) {
		console.error("Save note error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// DELETE /api/interviews/:id
app.delete("/api/interviews/:id", verifyAuthToken, async (req, res) => {
	try {
		const userId = req.userId;
		const interviewId = Number(req.params.id);

		if (!Number.isInteger(interviewId)) {
			return res.status(400).json({ error: "Invalid interview id" });
		}

		const result = await pool.query(
			"DELETE FROM interview_sessions WHERE id = $1 AND user_id = $2 RETURNING id",
			[interviewId, userId],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Interview not found" });
		}

		res.json({ success: true, deletedId: interviewId });
	} catch (err) {
		console.error("Delete interview error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ================= VAPI WEBHOOK ROUTE =================

// POST /api/vapi-webhook
app.post("/api/vapi-webhook", async (req, res) => {
	try {
		const payload = req.body;

		// Check if this is an end-of-call-report
		if (payload.type !== "end-of-call-report") {
			return res.json({ received: true });
		}

		const dbSessionId = payload.variableValues?.dbSessionId;
		const transcript = payload.transcript || "";

		if (!dbSessionId) {
			return res.status(400).json({ error: "Missing dbSessionId" });
		}

		const sessionResult = await pool.query(
			"SELECT interview_type FROM interview_sessions WHERE id = $1",
			[dbSessionId],
		);

		const interviewType =
			sessionResult.rows[0]?.interview_type || "behavioral";
		const interviewTypeLabel =
			interviewTypeLabels[interviewType] || "Behavioral";

		// Generate feedback using OpenAI
		const feedbackPrompt = `
You are an expert ${interviewTypeLabel.toLowerCase()} interview evaluator. Analyze the following interview transcript and provide structured feedback in JSON format.

Interview type:
${interviewTypeLabel}

Evaluation focus:
${
	interviewType === "technical"
		? "Depth of knowledge, correctness, problem-solving approach, and clarity of explanation."
		: interviewType === "system_design"
			? "Architecture thinking, tradeoffs, scalability, complexity management, and communication."
			: interviewType === "hr_culture_fit"
				? "Motivation, values alignment, situational judgment, and communication style."
				: "Communication, STAR structure, self-awareness, and clarity of examples."
}

Transcript:
${transcript}

Provide feedback in this exact JSON structure:
{
  "overallScore": <number 0-100>,
  "strengths": [<list of key strengths>],
  "gaps": [<list of areas for improvement>],
  "starFeedback": {
    "situation": "<advice on situation setup>",
    "task": "<advice on task definition>",
    "action": "<advice on actions taken>",
    "result": "<advice on results achieved>"
  },
  "recommendation": "<brief improvement recommendation>"
}
`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: feedbackPrompt,
				},
			],
		});

		const feedbackText = completion.choices[0].message.content;
		let feedbackReport;

		try {
			// Extract JSON from the response (might be wrapped in markdown)
			const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
			feedbackReport = JSON.parse(
				jsonMatch ? jsonMatch[0] : feedbackText,
			);
		} catch (parseErr) {
			console.error("Failed to parse feedback JSON:", feedbackText);
			feedbackReport = { rawFeedback: feedbackText };
		}

		// Update database with transcript and feedback
		await pool.query(
			"UPDATE interview_sessions SET transcript = $1, feedback_report = $2, status = $3 WHERE id = $4",
			[
				JSON.stringify({ text: transcript }),
				JSON.stringify(feedbackReport),
				"completed",
				dbSessionId,
			],
		);

		res.json({ success: true, feedbackReport });
	} catch (err) {
		console.error("Vapi webhook error:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

// ================= HEALTH CHECK =================

app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

// ================= SERVER STARTUP =================

async function startServer() {
	try {
		// Initialize database
		await initializeDatabase();

		app.listen(PORT, () => {
			console.log(`✅ Backend server running on port ${PORT}`);
		});
	} catch (err) {
		console.error("❌ Failed to start server:", err);
		process.exit(1);
	}
}

startServer();
