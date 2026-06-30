"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { callBackendAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface UserProfile {
	id: number;
	name: string;
	surname: string | null;
	email: string;
	age: number | null;
	course: string | null;
	qualifications: string | null;
	goals: string | null;
}

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState<Partial<UserProfile>>({});
	const [saving, setSaving] = useState(false);

	const fetchProfile = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await callBackendAPI("/api/user/profile", {
				method: "GET",
			});
			if (!response.ok) {
				throw new Error("Failed to load profile");
			}
			const data = await response.json();
			setProfile(data.profile);
			setFormData(data.profile);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load profile");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchProfile();
	}, []);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError("");

		try {
			const response = await callBackendAPI("/api/user/profile", {
				method: "POST",
				body: JSON.stringify({
					name: formData.name,
					surname: formData.surname,
					age: formData.age ? Number(formData.age) : null,
					course: formData.course,
					qualifications: formData.qualifications,
					goals: formData.goals,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update profile");
			}

			await fetchProfile();
			setIsEditing(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
				<Navbar />
				<div className="flex-1 flex items-center justify-center">
					<p className="text-zinc-400">Loading profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
			<Navbar />
			<div className="flex-1 overflow-y-auto py-12 px-4">
				<div className="max-w-3xl mx-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<div>
							<h1 className="text-4xl font-bold text-zinc-50 mb-2">Your Profile</h1>
							<p className="text-zinc-400">Manage your personal details and goals.</p>
						</div>
						{!isEditing && (
							<button
								onClick={() => setIsEditing(true)}
								className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition"
							>
								Edit Profile
							</button>
						)}
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200 text-sm">
							{error}
						</div>
					)}

					{/* Profile Card */}
					<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
						{!isEditing ? (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-1">First Name</h3>
										<p className="text-lg text-zinc-50">{profile?.name || "—"}</p>
									</div>
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-1">Surname</h3>
										<p className="text-lg text-zinc-50">{profile?.surname || "—"}</p>
									</div>
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-1">Email</h3>
										<p className="text-lg text-zinc-50">{profile?.email || "—"}</p>
									</div>
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-1">Age</h3>
										<p className="text-lg text-zinc-50">{profile?.age || "—"}</p>
									</div>
									<div className="md:col-span-2">
										<h3 className="text-sm font-medium text-zinc-500 mb-1">Current Course / Major</h3>
										<p className="text-lg text-zinc-50">{profile?.course || "—"}</p>
									</div>
								</div>

								<div className="border-t border-zinc-800 pt-6 space-y-6">
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-2">Qualifications & Skills</h3>
										<div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 min-h-[80px]">
											<p className="text-zinc-300 whitespace-pre-wrap">{profile?.qualifications || "No qualifications added yet."}</p>
										</div>
									</div>
									<div>
										<h3 className="text-sm font-medium text-zinc-500 mb-2">Career Goals</h3>
										<div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 min-h-[80px]">
											<p className="text-zinc-300 whitespace-pre-wrap">{profile?.goals || "No goals added yet."}</p>
										</div>
									</div>
								</div>
							</div>
						) : (
							<form onSubmit={handleSave} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">First Name</label>
										<input
											type="text"
											value={formData.name || ""}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">Surname</label>
										<input
											type="text"
											value={formData.surname || ""}
											onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">Email (Read Only)</label>
										<input
											type="email"
											value={profile?.email || ""}
											disabled
											className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-500 cursor-not-allowed"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">Age</label>
										<input
											type="number"
											value={formData.age || ""}
											onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-zinc-300 mb-2">Current Course / Major</label>
										<input
											type="text"
											value={formData.course || ""}
											onChange={(e) => setFormData({ ...formData, course: e.target.value })}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
										/>
									</div>
								</div>

								<div className="border-t border-zinc-800 pt-6 space-y-6">
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">Qualifications & Skills</label>
										<textarea
											value={formData.qualifications || ""}
											onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
											rows={3}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-zinc-300 mb-2">Career Goals</label>
										<textarea
											value={formData.goals || ""}
											onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
											rows={3}
											className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 focus:outline-none focus:border-violet-600 transition"
										/>
									</div>
								</div>

								<div className="flex items-center justify-end gap-4 pt-4">
									<button
										type="button"
										onClick={() => {
											setFormData(profile || {});
											setIsEditing(false);
											setError("");
										}}
										className="px-6 py-2 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg transition"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={saving}
										className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition disabled:opacity-50"
									>
										{saving ? "Saving..." : "Save Changes"}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
