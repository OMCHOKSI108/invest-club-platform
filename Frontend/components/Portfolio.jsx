// src/components/ProposalsVoting.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * ProposalsVoting.jsx
 *
 * Behaviour:
 * - Gets clubId from route params (preferred), then props, then localStorage fallback.
 * - Guards against missing clubId and shows a friendly message instead of sending a bad request.
 * - Submits a proposal to POST /api/clubs/:clubId/proposals (Authorization header if token exists).
 *
 * Notes:
 * - If you want automatic fallback to work, set localStorage.currentClubId when navigating to a club:
 *     localStorage.setItem('currentClubId', clubId);
 */

export default function ProposalsVoting(props) {
  const { clubId: paramClubId } = useParams();
  const navigate = useNavigate();

  // fallback order: route param -> props.clubId -> localStorage -> null
  const fallbackClubId = typeof window !== "undefined" ? localStorage.getItem("currentClubId") : null;
  const clubIdToUse = paramClubId || props?.clubId || fallbackClubId || null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    // optional: keep localStorage in sync when route provides clubId
    if (paramClubId) {
      try {
        localStorage.setItem("currentClubId", paramClubId);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [paramClubId]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    setError(null);
    setSuccessMsg(null);

    const id = clubIdToUse;

    if (!id) {
      setError("No club selected. Open this page from a club (URL: /club/<clubId>/proposals) or select a club first.");
      return;
    }

    if (!title?.trim()) {
      setError("Please enter a title for the proposal.");
      return;
    }

    // prepare payload
    const payload = {
      title: title.trim(),
      description: description.trim(),
      // Add any other fields your backend expects here
    };

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/clubs/${encodeURIComponent(id)}/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // read response text and try parse json for better errors
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        const serverMsg = data?.message || `Server returned ${res.status} ${res.statusText}`;
        throw new Error(serverMsg);
      }

      // success
      setSuccessMsg(data?.message || "Proposal created successfully!");
      setTitle("");
      setDescription("");
      // optionally redirect to proposals list after creation
      // navigate(`/club/${id}/proposals`);
    } catch (err) {
      console.error("Error creating proposal:", err);
      setError(err?.message || "Failed to create proposal. Check console/network.");
    } finally {
      setSubmitting(false);
    }
  };

  // If component is mounted without a clubId, show an informative screen instead of failing silently.
  if (!clubIdToUse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131712] text-white p-6">
        <div className="max-w-xl w-full bg-[#0d0d0d] rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4">Proposals</h2>
          <p className="text-gray-400 mb-4">
            This page expects a club context (clubId). Open proposals from a specific club page, e.g.{" "}
            <code className="bg-black px-1 rounded">/club/&lt;clubId&gt;/proposals</code>.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-green-500 text-black rounded-md"
            >
              Go back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 text-white rounded-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131712] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create a Proposal</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-900/60 border border-red-600 p-4 text-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-md bg-green-900/40 border border-green-500 p-4 text-green-200">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#0d0d0d] p-6 rounded-xl space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Club ID</label>
            <div className="text-sm text-gray-400">{clubIdToUse}</div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-gray-800 rounded px-3 py-2 text-white"
              placeholder="Proposal title"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full bg-black/20 border border-gray-800 rounded px-3 py-2 text-white"
              placeholder="Describe the proposal..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded font-medium disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Proposal"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setError(null);
                setSuccessMsg(null);
              }}
              className="bg-[#1a1a1a] border border-gray-700 px-4 py-2 rounded text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
