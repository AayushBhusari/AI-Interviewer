import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	const cookieStore = await cookies();

	// Delete the cookies by expiring them immediately
	cookieStore.set("auth_token", "", { maxAge: 0 });
	cookieStore.set("userId", "", { maxAge: 0 });

	return NextResponse.json({ success: true, message: "Logged out" });
}
