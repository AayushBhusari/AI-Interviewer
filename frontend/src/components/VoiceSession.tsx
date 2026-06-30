"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { callBackendAPI } from "@/lib/api";

interface VoiceSessionProps {
  onComplete: (sessionId: number) => void;
  interviewType: InterviewTypeKey;
}

type InterviewTypeKey =
  | "behavioral"
  | "technical"
  | "system_design"
  | "hr_culture_fit";

const interviewTypeMeta: Record<
  InterviewTypeKey,
  { label: string; title: string; tip: string }
> = {
  behavioral: {
    label: "Behavioral",
    title: "Behavioral Interview",
    tip: "Use STAR structure, highlight impact, and be specific.",
  },
  technical: {
    label: "Technical",
    title: "Technical Interview",
    tip: "Think aloud, explain tradeoffs, and be precise.",
  },
  system_design: {
    label: "System Design",
    title: "System Design Interview",
    tip: "Cover scale, bottlenecks, tradeoffs, and APIs.",
  },
  hr_culture_fit: {
    label: "HR / Culture Fit",
    title: "HR / Culture Fit Interview",
    tip: "Focus on motivation, values, and thoughtful examples.",
  },
};

export default function VoiceSession({
  onComplete,
  onBack,
  interviewType,
}: VoiceSessionProps) {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const vapiRef = useRef<typeof Vapi | null>(null);
  const [dbSessionId, setDbSessionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const interviewMeta = interviewTypeMeta[interviewType];

  useEffect(() => {
    // Initialize Vapi
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

    vapi.on("call-start", () => {
      console.log("Call started");
      setIsLive(true);
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setIsLive(false);
      if (dbSessionId) {
        onComplete(dbSessionId);
      }
    });

    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
      setError("An error occurred during the call");
      setIsLive(false);
    });

    vapiRef.current = vapi;

    return () => {
      vapi.stop();
    };
  }, [dbSessionId, onComplete]);

  const handleStartInterview = async () => {
    setLoading(true);
    setError("");

    try {
      // Create interview session in backend
      const response = await callBackendAPI("/api/interviews/start", {
        method: "POST",
        body: JSON.stringify({ interviewType }),
      });

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      const data = await response.json();
      const sessionId = data.dbSessionId;
      setDbSessionId(sessionId);

      // Start Vapi call with dbSessionId as variable
      const vapi = vapiRef.current;
      if (vapi) {
        vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
          variableValues: {
            dbSessionId: sessionId.toString(),
            interviewType,
          },
        });
      }
    } catch (err) {
      console.error("Error starting interview:", err);
      setError("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    const vapi = vapiRef.current;
    if (vapi) {
      vapi.stop();
      alert("interview ended");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        {!isLive && onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition"
          >
            <span>←</span> Back to Dashboard
          </button>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-50 mb-2">
            {interviewMeta.title}
          </h1>
          <p className="text-zinc-400">
            {interviewMeta.label} · AI-Powered Mock Interview Session
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          {/* Audio Visualization */}
          <div className="mb-12 flex justify-center">
            <div
              className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                isLive
                  ? "bg-fuchsia-500/10 border-fuchsia-500/40 animate-pulse"
                  : "bg-zinc-800 border-zinc-700"
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/20 to-transparent"></div>

              {/* Icon */}
              <div className="relative z-10">
                {isLive ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-3xl text-fuchsia-400">🎤</div>
                    <div className="text-xs font-medium text-fuchsia-400">
                      LIVE
                    </div>
                  </div>
                ) : (
                  <div className="text-4xl text-zinc-500">🎧</div>
                )}
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="mb-8">
            {isLive ? (
              <div>
                <p className="text-lg font-semibold text-zinc-50 mb-2">
                  Interview In Progress
                </p>
                <p className="text-zinc-400">
                  The AI interviewer is listening. Answer clearly and naturally.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-zinc-50 mb-2">
                  Ready to Start
                </p>
                <p className="text-zinc-400">
                  Click the button below to begin your interview session
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {!isLive ? (
              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Starting..." : "Start Interview"}
              </button>
            ) : (
              <button
                onClick={handleEndInterview}
                className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg transition"
              >
                End & Submit Interview
              </button>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">💡 Tip: {interviewMeta.tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
