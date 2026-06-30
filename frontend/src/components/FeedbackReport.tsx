"use client";

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

interface FeedbackReportProps {
  feedback: FeedbackReportData;
  onDismiss: () => void;
}

export default function FeedbackReport({
  feedback,
  onDismiss,
}: FeedbackReportProps) {
  if (!feedback) return null;

  const score = feedback.overallScore || 0;
  const strengths = feedback.strengths || [];
  const gaps = feedback.gaps || [];
  const starFeedback = feedback.starFeedback || {};
  const recommendation = feedback.recommendation || "";

  // Score color based on value
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Score background color
  const getScoreBgColor = (value: number) => {
    if (value >= 80) return "bg-green-950";
    if (value >= 60) return "bg-yellow-950";
    return "bg-red-950";
  };

  return (
    <div className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-50 mb-2">
            Interview Feedback
          </h1>
          <p className="text-zinc-400">Your comprehensive evaluation report</p>
        </div>

        {/* Overall Score Card */}
        <div
          className={`${getScoreBgColor(
            score,
          )} border-2 border-zinc-800 rounded-2xl p-12 mb-8 text-center`}
        >
          <p className="text-zinc-400 mb-2">Overall Performance Score</p>
          <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}%
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative w-32 h-32 mx-auto mt-6">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-zinc-800"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                className={getScoreColor(score)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}
              </span>
            </div>
          </div>
        </div>

        {/* Strengths Section */}
        {strengths.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-zinc-50 mb-4 flex items-center gap-2">
              <span className="text-green-400">✓</span> Strengths
            </h2>
            <ul className="space-y-3">
              {strengths.map((strength: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-zinc-300">
                  <span className="text-green-400 font-bold">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gaps Section */}
        {gaps.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-zinc-50 mb-4 flex items-center gap-2">
              <span className="text-yellow-400">!</span> Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {gaps.map((gap: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-zinc-300">
                  <span className="text-yellow-400 font-bold">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* STAR Feedback Section */}
        {Object.keys(starFeedback).length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-zinc-50 mb-6">
              STAR Method Feedback
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Situation */}
              {starFeedback.situation && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-violet-400 font-semibold mb-2">
                    Situation
                  </h3>
                  <p className="text-zinc-300 text-sm">
                    {starFeedback.situation}
                  </p>
                </div>
              )}

              {/* Task */}
              {starFeedback.task && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-violet-400 font-semibold mb-2">Task</h3>
                  <p className="text-zinc-300 text-sm">{starFeedback.task}</p>
                </div>
              )}

              {/* Action */}
              {starFeedback.action && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-violet-400 font-semibold mb-2">Action</h3>
                  <p className="text-zinc-300 text-sm">{starFeedback.action}</p>
                </div>
              )}

              {/* Result */}
              {starFeedback.result && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-violet-400 font-semibold mb-2">Result</h3>
                  <p className="text-zinc-300 text-sm">{starFeedback.result}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendation Section */}
        {recommendation && (
          <div className="bg-violet-950 border border-violet-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-violet-100 mb-4">
              Recommendation
            </h2>
            <p className="text-violet-200">{recommendation}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={onDismiss}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
