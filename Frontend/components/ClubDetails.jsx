// src/pages/ClubDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const FALLBACK_CLUB = {
  id: "fallback",
  name: "Club Details Unavailable",
  description: "Could not load club data. This is fallback content.",
  pool: "$0",
  members: 0,
  returns: "0%",
};

export default function ClubDetails() {
  const { clubId } = useParams(); // ✅ fixed param
  const navigate = useNavigate();
  const [club, setClub] = useState(FALLBACK_CLUB);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(""); // shows red banner
  const API_BASE = import.meta.env.VITE_APP_API_BASE || "/api";

  useEffect(() => {
    let mounted = true;
    async function fetchClub() {
      setLoading(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE}/clubs/${encodeURIComponent(clubId)}`; // ✅ fixed
        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          const truncated =
            text.length > 800 ? text.slice(0, 800) + "..." : text;
          const msg = `Server returned ${res.status} ${res.statusText}. Response preview: ${truncated}`;
          if (mounted) {
            setErrorMsg(msg);
            setClub(FALLBACK_CLUB);
            setLoading(false);
          }
          return;
        }

        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text();
          const truncated =
            text.length > 800 ? text.slice(0, 800) + "..." : text;
          const msg = `Expected JSON but received content-type: ${ct}. Response preview: ${truncated}`;
          if (mounted) {
            setErrorMsg(msg);
            setClub(FALLBACK_CLUB);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        const receivedClub = data?.club ?? data ?? null;
        if (mounted) {
          if (
            receivedClub &&
            (receivedClub.name || receivedClub._id || receivedClub.id)
          ) {
            setClub(receivedClub);
          } else {
            setClub(FALLBACK_CLUB);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setErrorMsg(`Network/Fetch error: ${err?.message || "unknown"}`);
          setClub(FALLBACK_CLUB);
          setLoading(false);
        }
      }
    }

    if (clubId) {
      fetchClub();
    }
    return () => (mounted = false);
  }, [API_BASE, clubId]); // ✅ fixed

  return (
    <div className="min-h-screen bg-[#131712] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
        <p className="text-gray-400 mb-6">{club.description}</p>

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-6 rounded-md border border-red-600 bg-red-900/60 p-4">
            <p className="text-red-400 font-medium">
              Unexpected token &lt; — response was not JSON
            </p>
            <pre className="text-xs text-red-200 overflow-x-auto mt-2">
              {errorMsg}
            </pre>
            <p className="text-sm text-red-300 mt-2">
              Tip: open DevTools → Network → check request to{" "}
              <code className="bg-black px-1 rounded">
                {`${API_BASE}/clubs/${clubId}`} {/* ✅ fixed */}
              </code>
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading club details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 bg-[#0d0d0d] p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Club Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#131212] rounded">
                  <p className="text-xs text-gray-400">Total Pool</p>
                  <p className="font-bold">
                    {club.totalValue ?? club.pool ?? "$0"}
                  </p>
                </div>
                <div className="p-4 bg-[#131212] rounded">
                  <p className="text-xs text-gray-400">Members</p>
                  <p className="font-bold">
                    {club.memberCount ?? club.members ?? 0}
                  </p>
                </div>
                <div className="p-4 bg-[#131212] rounded">
                  <p className="text-xs text-gray-400">Returns</p>
                  <p className="font-bold text-green-400">
                    {club.monthlyReturn ?? club.returns ?? "0%"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-300 text-sm">
                  {club.longDescription ??
                    club.description ??
                    "No detailed description available."}
                </p>
              </div>
            </div>

            <aside className="bg-[#0d0d0d] p-6 rounded-xl">
              <h3 className="font-semibold mb-3">Actions</h3>

              {club.membership ? (
                <div className="mb-4">
                  <div className="bg-green-500 text-black px-4 py-2 rounded text-center">
                    Member ({club.membership.role})
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <button className="w-full bg-green-500 text-black px-4 py-2 rounded">
                    Join Club
                  </button>
                </div>
              )}

              <div className="text-sm text-gray-400">
                <p>
                  <strong>Category:</strong> {club.category ?? "General"}
                </p>
                <p className="mt-2">
                  <strong>Owner:</strong>{" "}
                  {club.ownerId
                    ? `${club.ownerId.firstName ?? ""} ${
                        club.ownerId.lastName ?? ""
                      }`
                    : "—"}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
