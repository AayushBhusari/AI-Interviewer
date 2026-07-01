import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function handleProxy(req: NextRequest) {
	try {
		// Extract path from the URL
		const url = new URL(req.url);
		const path = url.pathname.replace("/api/interviews", "");
		
		// Build backend URL
		const targetUrl = `${BACKEND_URL}/api/interviews${path}${url.search}`;
		
		// Get cookies
		const cookieStore = await cookies();
		let authToken = cookieStore.get("auth_token")?.value;
		
		// Fallback to reading the raw Cookie header directly
		if (!authToken) {
			const rawCookies = req.headers.get("cookie") || "";
			authToken = rawCookies
				.split(";")
				.map((pair) => pair.trim())
				.find((pair) => pair.startsWith("auth_token="))
				?.slice("auth_token=".length);
		}
		
		// Forward headers
		const headers = new Headers();
		headers.set("Content-Type", "application/json");
		if (authToken) {
			headers.set("Authorization", `Bearer ${authToken}`);
		}
		
		// Setup fetch options
		const options: RequestInit = {
			method: req.method,
			headers,
		};
		
		// Forward body if present
		if (req.method !== "GET" && req.method !== "HEAD") {
			const text = await req.text();
			if (text) {
				options.body = text;
			}
		}
		
		const response = await fetch(targetUrl, options);
		
		// Handle response
		const data = await response.text();
		
		return new NextResponse(data, {
			status: response.status,
			headers: {
				"Content-Type": response.headers.get("Content-Type") || "application/json",
			},
		});
	} catch (error) {
		console.error("Proxy error:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
