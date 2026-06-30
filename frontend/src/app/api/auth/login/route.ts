import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { email, password } = await request.json();

		// Call backend login endpoint
		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/login`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			},
		);

		if (!backendResponse.ok) {
			const error = await backendResponse.json();
			return NextResponse.json(
				{ error: error.error || "Invalid credentials" },
				{ status: 401 },
			);
		}

		const data = await backendResponse.json();
		const token = data.token;
		const userId = data.userId;

		// Set token as HTTP-only cookie
		const cookieStore = await cookies();
		cookieStore.set("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 2,
		});

		// Also store userId for client-side reference
		cookieStore.set("userId", userId.toString(), {
			httpOnly: false,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 2,
		});

		return NextResponse.json({
			success: true,
			message: "Logged in successfully!",
		});
	} catch (err) {
		console.error("Login error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
