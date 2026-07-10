"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [loading, setLoading] = useState(false);

	// Don't show navbar on login/signup pages
	if (pathname === "/login" || pathname === "/signup") {
		return null;
	}

	const handleLogout = async () => {
		setLoading(true);
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/login");
		router.refresh();
	};

	return (
		<nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link href="/dashboard" className="flex items-center gap-2">
						<div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold">A</span>
						</div>
						<span className="text-xl font-bold text-zinc-50">
							Adler
						</span>
					</Link>

					{/* Nav Links */}
					<div className="flex items-center gap-6">
						<Link
							href="/dashboard"
							className={`font-medium transition ${
								pathname === "/dashboard"
									? "text-violet-400"
									: "text-zinc-400 hover:text-zinc-300"
							}`}
						>
							Dashboard
						</Link>

						<Link
							href="/profile"
							className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition ${
								pathname === "/profile"
									? "border-violet-500 bg-violet-600/20 text-violet-300"
									: "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
							}`}
							title="View Profile"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-5 h-5"
							>
								<path
									fillRule="evenodd"
									d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
									clipRule="evenodd"
								/>
							</svg>
						</Link>

						{/* Logout Button */}
						<button
							onClick={handleLogout}
							disabled={loading}
							className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition disabled:opacity-50"
						>
							{loading ? "Logging out..." : "Logout"}
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
