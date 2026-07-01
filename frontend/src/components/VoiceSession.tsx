"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { callBackendAPI } from "@/lib/api";

interface VoiceSessionProps {
  onComplete: (sessionId: number) => void;
  onBack?: () => void;
  interviewType: InterviewTypeKey;
}

export type InterviewTypeKey =
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

interface UserProfile {
  name: string;
  course: string | null;
  qualifications: string | null;
  goals: string | null;
}

export default function VoiceSession({
  onComplete,
  onBack,
  interviewType,
}: VoiceSessionProps) {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const [dbSessionId, setDbSessionId] = useState<number | null>(null);
  const dbSessionIdRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [showEndedModal, setShowEndedModal] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetRole, setTargetRole] = useState("React Developer");

  const interviewMeta = interviewTypeMeta[interviewType];

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await callBackendAPI("/api/user/profile", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        }
      } catch (err) {
        console.error("Failed to load profile for voice session", err);
      }
    };
    void fetchProfile();
  }, []);

  useEffect(() => {
    // Initialize Vapi
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

    vapi.on("call-start", () => {
      console.log("Call started");
      setIsLive(true);
      setLoading(false);
    });
    //test here
    vapi.on('speech-start', () => {
      console.log('🎤 Hardware Signal: Mic detected audio threshold crossing.');
    });

    vapi.on('message', (message) => {
      // This event captures the exact packets Vapi sends back while you are talking
      if (message.type === 'transcript' && message.role === 'user') {
        console.log(`✨ Live User Text Captured: ${message.transcript}`);
      }
    });
    //test end
    vapi.on("call-end", () => {
      console.log("Call ended");
      setIsLive(false);
      setLoading(false);
      setShowEndedModal(true);
    });

    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
      console.log("---------------");
      if (error?.error?.msg) {
        console.log(error.error.msg);
      }

      setError("Failed to establish voice session. Please ensure your microphone is enabled.");
      setIsLive(false);
      setLoading(false);
    });

    vapiRef.current = vapi;

    return () => {
      vapi.stop();
    };
  }, [onComplete]);

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
      dbSessionIdRef.current = sessionId;

      // Start Vapi call with dbSessionId as variable
      const vapi = vapiRef.current;
      if (vapi) {
        vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {

          variableValues: {
            dbSessionId: sessionId.toString(),
            interviewType,
            name: profile?.name || "",
            course: profile?.course || "",
            qualifications: profile?.qualifications || "",
            goals: profile?.goals || "",
            targetRole: targetRole,
          },
        });
      }
    } catch (err) {
      console.error("Error starting interview:", err);
      setError("Failed to start interview. Please try again.");
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    const vapi = vapiRef.current;
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        {!isLive && !loading && onBack && (
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
              className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isLive
                ? "bg-fuchsia-500/10 border-fuchsia-500/40 animate-pulse"
                : loading
                  ? "bg-violet-500/10 border-violet-500/40"
                  : "bg-zinc-800 border-zinc-700"
                }`}
            >
              {loading && (
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
              )}
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
                ) : loading ? (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl text-violet-400 animate-bounce">⚡</div>
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
            ) : loading ? (
              <div>
                <p className="text-lg font-semibold text-zinc-50 mb-2 animate-pulse">
                  Connecting to Evaluator...
                </p>
                <p className="text-zinc-400 max-w-sm mx-auto">
                  Please enable microphone access if prompted. Starting mock interview session...
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-zinc-50 mb-2">
                  Ready to Start
                </p>
                <p className="text-zinc-400 mb-6">
                  Fill out the target role and click the button below to begin
                  your session.
                </p>

                <div className="text-left mb-6 max-w-sm mx-auto">
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    What role are you interviewing for?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-violet-600 transition"
                    required
                  />
                </div>
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
            {loading ? (
              <button
                disabled
                className="px-8 py-3 bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold rounded-lg transition flex items-center gap-3 cursor-not-allowed"
              >
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                Starting Interview...
              </button>
            ) : !isLive ? (
              <button
                onClick={handleStartInterview}
                disabled={!targetRole.trim()}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Interview
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

      {/* Modal */}
      {showEndedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-500"></div>

            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-violet-400">🎉</span>
            </div>

            {/* Title & Message */}
            <h2 className="text-2xl font-bold text-zinc-50 mb-3">
              Interview Completed
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              Great job! Your responses have been submitted successfully. Our AI evaluator is already analyzing your transcript to generate your detailed feedback report.
            </p>

            {/* Action Button */}
            <button
              onClick={() => {
                setShowEndedModal(false);
                if (dbSessionIdRef.current) {
                  onComplete(dbSessionIdRef.current);
                } else if (onBack) {
                  onBack();
                }
              }}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition shadow-lg shadow-violet-600/20"
            >
              Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
