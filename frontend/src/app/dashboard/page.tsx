"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VoiceSession from "@/components/VoiceSession";
import FeedbackReport from "@/components/FeedbackReport";
import Navbar from "@/components/Navbar";
import { callBackendAPI } from "@/lib/api";

interface FeedbackReportData {
  overallScore?: number;
  strengths?: string[];
  gaps?: string[];
  starFeedback?: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
  recommendation?: string;
}

// NOTE: reconstructed — wasn't present in the pasted code, adjust to match
// your actual API response shape.
interface Interview {
  id: number;
  created_at: string;
  status: "completed" | "in_progress";
  interview_type: string;
  notes?: string;
  feedback_report?: FeedbackReportData;
}

type ViewState = "dashboard" | "voice_session" | "feedback";

// NOTE: reconstructed — adjust labels/accents/keys to match your actual options.
const interviewTypeOptions = [
  {
    key: "behavioral",
    title: "Behavioral",
    label: "Behavioral",
    description:
      "Practice answering behavioral questions using the STAR method.",
    accent: "from-violet-600/20 to-fuchsia-500/20",
  },
  {
    key: "technical",
    title: "Technical",
    label: "Technical",
    description: "Practice technical / problem-solving interview questions.",
    accent: "from-blue-600/20 to-cyan-500/20",
  },
  {
    key: "system_design",
    title: "System Design",
    label: "System Design",
    description:
      "Architecture thinking, tradeoffs, and communicating complexity.",
    accent: "from-emerald-600/20 to-teal-500/20",
  },
  {
    key: "hr_culture_fit",
    title: "HR / Culture Fit",
    label: "HR / Culture Fit",
    description: "Motivation, values alignment, and situational judgment.",
    accent: "from-amber-600/20 to-orange-500/20",
  },
];

export default function InterviewDashboardPage() {
  const router = useRouter();

  const [view, setView] = useState<ViewState>("dashboard");
  const [selectedInterviewType, setSelectedInterviewType] = useState(
    interviewTypeOptions[0].key,
  );
  const [selectedFeedback, setSelectedFeedback] = useState<
    FeedbackReportData | undefined
  >(undefined);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNoteId, setSavingNoteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const refreshInterviews = async () => {
    setLoading(true);
    try {
      const response = await callBackendAPI("/api/interviews", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to load interviews");
      }
      const data = await response.json();
      setInterviews(data.interviews ?? data ?? []);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to load interviews",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewFeedback = (feedback?: FeedbackReportData) => {
    if (!feedback) return;
    setSelectedFeedback(feedback);
    setView("feedback");
  };

  const handleInterviewComplete = async () => {
    await refreshInterviews();
    setView("dashboard");
  };

  const handleEditNote = (interview: Interview) => {
    setEditingNoteId(interview.id);
    setNoteDraft(interview.notes || "");
    setActionError("");
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteDraft("");
  };

  const handleSaveNote = async (interviewId: number) => {
    setSavingNoteId(interviewId);
    setActionError("");

    try {
      const response = await callBackendAPI(
        `/api/interviews/${interviewId}/note`,
        {
          method: "PATCH",
          body: JSON.stringify({ note: noteDraft }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save note");
      }

      await refreshInterviews();
      setEditingNoteId(null);
      setNoteDraft("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save note",
      );
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteInterview = async (interviewId: number) => {
    const confirmed = window.confirm(
      "Delete this interview session? This cannot be undone.",
    );

    if (!confirmed) return;

    setDeletingId(interviewId);
    setActionError("");

    try {
      const response = await callBackendAPI(`/api/interviews/${interviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to delete interview");
      }

      await refreshInterviews();
      if (editingNoteId === interviewId) {
        handleCancelNote();
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete interview",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
    setSelectedFeedback(undefined);
    setActionError("");
  };

  // Voice Session View
  if (view === "voice_session") {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
        <Navbar />
        <div className="flex-1 overflow-y-auto flex flex-col">
          <VoiceSession
            onComplete={handleInterviewComplete}
            onBack={handleBackToDashboard}
            interviewType={selectedInterviewType}
          />
        </div>
      </div>
    );
  }

  // Feedback View
  if (view === "feedback") {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
        <Navbar />
        <div className="flex-1 overflow-y-auto flex flex-col">
          <FeedbackReport
            feedback={selectedFeedback}
            onDismiss={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      <Navbar />
      <div className="flex-1 overflow-y-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-zinc-50 mb-2">
              Interview Dashboard
            </h1>
            <p className="text-zinc-400">
              Manage and track your practice interview sessions
            </p>
          </div>

          {/* New Interview Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-12">
            <div className="flex items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-50 mb-2">
                  Choose your interview type
                </h2>
                <p className="text-zinc-400">
                  Pick the format you want to practice, then start the session.
                </p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviewTypeOptions.map((option) => {
                const isSelected = selectedInterviewType === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedInterviewType(option.key);
                    }}
                    className={`text-left rounded-xl border p-5 transition hover:scale-[1.01] ${
                      isSelected
                        ? `border-violet-500 bg-gradient-to-br ${option.accent} shadow-lg shadow-violet-500/20`
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-zinc-50">
                          {option.title}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          {option.description}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-violet-200/90">
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-zinc-400">
                Selected:{" "}
                <span className="text-zinc-50 font-medium">
                  {
                    interviewTypeOptions.find(
                      (option) => option.key === selectedInterviewType,
                    )?.title
                  }
                </span>
              </p>
              <button
                onClick={() => setView("voice_session")}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                Start{" "}
                {
                  interviewTypeOptions.find(
                    (option) => option.key === selectedInterviewType,
                  )?.title
                }{" "}
                Interview
              </button>
            </div>
          </div>

          {/* Past Interviews Section */}
          <div>
            {actionError && (
              <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/60 px-4 py-3 text-sm text-red-200">
                {actionError}
              </div>
            )}
            <h2 className="text-2xl font-bold text-zinc-50 mb-6">
              Past Interviews
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-zinc-400">Loading interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-zinc-400 mb-4">No interviews yet</p>
                <p className="text-zinc-500 text-sm">
                  Start your first interview to see results here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.map((interview) => {
                  const feedback = interview.feedback_report;
                  const score = feedback?.overallScore || 0;
                  const isCompleted = interview.status === "completed";
                  const isEditingNote = editingNoteId === interview.id;
                  const sessionTypeLabel =
                    interviewTypeOptions.find(
                      (option) => option.key === interview.interview_type,
                    )?.title || "Behavioral";

                  return (
                    <div
                      key={interview.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition cursor-pointer"
                      onClick={() => {
                        if (isCompleted && feedback) {
                          handleViewFeedback(feedback);
                        }
                      }}
                    >
                      {/* Date */}
                      <div className="text-sm text-zinc-500 mb-4">
                        {new Date(interview.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-200 rounded-full text-xs font-semibold">
                          {sessionTypeLabel}
                        </span>
                        {interview.notes && (
                          <span className="inline-block px-3 py-1 bg-violet-950 text-violet-200 rounded-full text-xs font-semibold">
                            Note saved
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="mb-4">
                        {isCompleted ? (
                          <span className="inline-block px-3 py-1 bg-green-950 text-green-300 rounded-full text-xs font-semibold">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-yellow-950 text-yellow-300 rounded-full text-xs font-semibold">
                            ⏳ In Progress
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      <div
                        className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-sm font-medium text-zinc-200">
                            Session Notes
                          </p>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditNote(interview);
                            }}
                            className="text-xs text-violet-400 hover:text-violet-300"
                          >
                            {interview.notes ? "Edit note" : "Add note"}
                          </button>
                        </div>

                        {isEditingNote ? (
                          <div className="space-y-3">
                            <textarea
                              value={noteDraft}
                              onChange={(event) =>
                                setNoteDraft(event.target.value)
                              }
                              onClick={(event) => event.stopPropagation()}
                              placeholder="Add a short note about this session..."
                              rows={3}
                              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 placeholder-zinc-500 focus:border-violet-600 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleSaveNote(interview.id);
                                }}
                                disabled={savingNoteId === interview.id}
                                className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                              >
                                {savingNoteId === interview.id
                                  ? "Saving..."
                                  : "Save note"}
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCancelNote();
                                }}
                                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : interview.notes ? (
                          <p className="text-sm leading-6 text-zinc-300">
                            {interview.notes}
                          </p>
                        ) : (
                          <p className="text-sm text-zinc-500">
                            No notes saved for this session yet.
                          </p>
                        )}
                      </div>

                      {/* Score */}
                      {isCompleted && feedback && (
                        <div className="mt-4 mb-4">
                          <div className="flex items-end justify-between mb-2">
                            <span className="text-sm text-zinc-400">
                              Performance Score
                            </span>
                            <span className="text-2xl font-bold text-violet-400">
                              {score}%
                            </span>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${score}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between gap-3">
                          {isCompleted ? (
                            <button className="text-violet-400 hover:text-violet-300 font-semibold text-sm transition">
                              View Full Report →
                            </button>
                          ) : (
                            <button className="text-zinc-400 text-sm">
                              Waiting for completion...
                            </button>
                          )}

                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteInterview(interview.id);
                            }}
                            disabled={deletingId === interview.id}
                            className="rounded-lg border border-red-900/50 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/50 disabled:opacity-50"
                          >
                            {deletingId === interview.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
