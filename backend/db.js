import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
	// Neon-optimized settings for serverless
	max: 5,
	idleTimeoutMillis: 30000, // Close idle connections after 30s
	connectionTimeoutMillis: 15000, // Allow extra time for Neon cold starts
	allowExitOnIdle: true,
});

async function connectWithRetry(retries = 3) {
	let lastError;

	for (let attempt = 1; attempt <= retries; attempt += 1) {
		try {
			return await pool.connect();
		} catch (error) {
			lastError = error;
			if (attempt < retries) {
				await new Promise((resolve) =>
					setTimeout(resolve, attempt * 1000),
				);
			}
		}
	}

	throw lastError;
}

// Initialize database schema
export async function initializeDatabase() {
	const client = await connectWithRetry();
	try {
		// Create users table
		await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

		// Create interview_sessions table
		await client.query(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
				interview_type VARCHAR(50) NOT NULL DEFAULT 'behavioral',
				notes TEXT,
        transcript JSONB,
        feedback_report JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

		await client.query(`
		  ALTER TABLE interview_sessions
		  ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50) NOT NULL DEFAULT 'behavioral';
		`);

		await client.query(`
		  ALTER TABLE interview_sessions
		  ADD COLUMN IF NOT EXISTS notes TEXT;
		`);

		console.log("✅ Database initialized successfully");
	} catch (err) {
		console.error("❌ Database initialization error:", err);
		throw err;
	} finally {
		client.release();
	}
}

export default pool;
