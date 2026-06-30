import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuthToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const cookieHeader = req.headers.cookie || "";
	const cookieToken = cookieHeader
		.split(";")
		.map((pair) => pair.trim())
		.find((pair) => pair.startsWith("auth_token="))
		?.slice("auth_token=".length);

	const token = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7)
		: cookieToken;

	if (!token) {
		return res.status(401).json({ error: "Missing or invalid token" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.userId = decoded.userId;
		req.userEmail = decoded.email;
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}
