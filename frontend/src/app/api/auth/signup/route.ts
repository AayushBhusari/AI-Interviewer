import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { name, email, password, confirmPassword } = await request.json();

		if (!name || !email || !password || !confirmPassword) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		if (password !== confirmPassword) {
			return NextResponse.json(
				{ error: "Passwords do not match" },
				{ status: 400 },
			);
		}

		// Call backend signup endpoint
		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/signup`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			},
		);

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ error: data.error || "Signup failed" },
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Account created successfully!",
		});
	} catch (err) {
		console.error("Signup error:", err);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
