import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	const cookieStore = await cookies();

	// Delete the cookies by expiring them immediately with matching options
	cookieStore.set("auth_token", "", { path: "/", sameSite: "lax", maxAge: 0 });
	cookieStore.set("userId", "", { path: "/", sameSite: "lax", maxAge: 0 });

	return NextResponse.json({ success: true, message: "Logged out" });
}
