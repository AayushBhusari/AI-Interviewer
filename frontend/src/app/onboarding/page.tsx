"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { callBackendAPI } from "@/lib/api";

export default function OnboardingPage() {
	const [surname, setSurname] = useState("");
	const [age, setAge] = useState("");
	const [course, setCourse] = useState("");
	const [qualifications, setQualifications] = useState("");
	const [goals, setGoals] = useState("");
	
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleOnboardingSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await callBackendAPI("/api/user/profile", {
				method: "POST",
				body: JSON.stringify({
					surname,
					age: age ? parseInt(age, 10) : null,
					course,
					qualifications,
					goals,
				}),
			});

			if (response.ok) {
				router.push("/dashboard");
				router.refresh();
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save details");
			}
		} catch {
			setError("Failed to connect to server");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-lg">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-zinc-50 mb-2">
						Welcome to Mentorque!
					</h1>
					<p className="text-zinc-400">
						Let's get to know you better to personalize your interviews.
					</p>
				</div>

				{/* Card */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
					<form onSubmit={handleOnboardingSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							{/* Surname Input */}
							<div>
								<label className="block text-sm font-medium text-zinc-300 mb-2">
									Surname
								</label>
								<input
									type="text"
									placeholder="Doe"
									value={surname}
									onChange={(e) => setSurname(e.target.value)}
									required
									className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
								/>
							</div>

							{/* Age Input */}
							<div>
								<label className="block text-sm font-medium text-zinc-300 mb-2">
									Age
								</label>
								<input
									type="number"
									placeholder="22"
									min="13"
									max="100"
									value={age}
									onChange={(e) => setAge(e.target.value)}
									required
									className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
								/>
							</div>
						</div>

						{/* Course Input */}
						<div>
							<label className="block text-sm font-medium text-zinc-300 mb-2">
								Current Course / Major
							</label>
							<input
								type="text"
								placeholder="e.g. B.S. Computer Science"
								value={course}
								onChange={(e) => setCourse(e.target.value)}
								required
								className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
							/>
						</div>

						{/* Qualifications Input */}
						<div>
							<label className="block text-sm font-medium text-zinc-300 mb-2">
								Key Qualifications / Skills
							</label>
							<textarea
								placeholder="e.g. React, Node.js, Python, AWS..."
								value={qualifications}
								onChange={(e) => setQualifications(e.target.value)}
								rows={2}
								required
								className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
							/>
						</div>

						{/* Goals Input */}
						<div>
							<label className="block text-sm font-medium text-zinc-300 mb-2">
								Career Goals
							</label>
							<textarea
								placeholder="What role are you preparing for?"
								value={goals}
								onChange={(e) => setGoals(e.target.value)}
								rows={2}
								required
								className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition"
							/>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-3 bg-red-950 border border-red-800 rounded-lg text-red-200 text-sm">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50 mt-6"
						>
							{loading ? "Saving..." : "Complete Setup & Go to Dashboard"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}