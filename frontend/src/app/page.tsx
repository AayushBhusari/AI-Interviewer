"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if logged in, otherwise to login
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "", password: "" }),
        });

        // If we get unauthorized, go to login. Otherwise go to dashboard.
        if (response.status === 401) {
          router.push("/login");
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="text-center">
        <div className="mb-4 text-4xl">🎤</div>
        <p className="text-zinc-400">Loading Mentorque...</p>
      </div>
    </div>
  );
}
