// src/pages/Clubs.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const FALLBACK_CLUBS = [
  { id: "1", name: "Future Tech Innovators", description: "Investing in AI, robotics and emerging tech.", category: "Technology" },
  { id: "2", name: "Green Energy Fund", description: "Renewable energy & sustainable businesses.", category: "Energy" },
  { id: "3", name: "Global Growth Seekers", description: "High-growth opportunities in international markets.", category: "International" },
];

export default function Clubs() {
  const [clubs, setClubs] = useState(FALLBACK_CLUBS);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [joiningClubId, setJoiningClubId] = useState(null);
  const [joinStatus, setJoinStatus] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [pingOk, setPingOk] = useState(null);
  const navigate = useNavigate();

  // <-- IMPORTANT: ensure this points at your backend
  // If you deploy backend to a different origin, set VITE_API_BASE in .env to that URL.
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

  // quick ping to check server connectivity (no server changes required)
  useEffect(() => {
    let mounted = true;
    async function ping() {
      try {
        const res = await fetch(`${API_BASE}/clubs/ping`, { headers: { Accept: "application/json" } });
        const text = await res.text();
        // if server returned HTML or non-json, show it
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          const preview = text.length > 500 ? text.slice(0, 500) + "..." : text;
          if (mounted) setPingOk({ ok: false, status: res.status, preview });
          return;
        }
        if (!contentType.includes("application/json")) {
          const preview = text.length > 500 ? text.slice(0, 500) + "..." : text;
          if (mounted) setPingOk({ ok: false, status: res.status, preview });
          return;
        }
        const data = JSON.parse(text);
        if (mounted) setPingOk({ ok: true, data });
      } catch (err) {
        if (mounted) setPingOk({ ok: false, error: err.message || "network error" });
      }
    }
    ping();
    return () => (mounted = false);
  }, [API_BASE]);

  useEffect(() => {
    let mounted = true;
    async function fetchClubs() {
      setLoading(true);
      setErrorMsg("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/clubs`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const text = await res.text();
          const truncated = text.length > 500 ? text.slice(0, 500) + "..." : text;
          const msg = `Server returned ${res.status} ${res.statusText}. Response preview: ${truncated}`;
          if (mounted) {
            setErrorMsg(msg);
            setClubs(FALLBACK_CLUBS);
            setLoading(false);
          }
          return;
        }

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          const truncated = text.length > 500 ? text.slice(0, 500) + "..." : text;
          const msg = `Expected JSON but received content-type: ${contentType}. Response preview: ${truncated}`;
          if (mounted) {
            setErrorMsg(msg);
            setClubs(FALLBACK_CLUBS);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.clubs ?? [];
        if (mounted) {
          setClubs(list.length ? list : FALLBACK_CLUBS);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setErrorMsg(`Network/Fetch error: ${err?.message || "unknown"}`);
          setClubs(FALLBACK_CLUBS);
          setLoading(false);
        }
      }
    }

    fetchClubs();
    return () => (mounted = false);
  }, [API_BASE]);

  const handleJoinClub = async (clubId) => {
    setJoiningClubId(clubId);
    setJoinStatus((prev) => ({ ...prev, [clubId]: "" }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/clubs/${encodeURIComponent(clubId)}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text();
      let payload = {};
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { message: text };
      }

      if (res.ok) {
        setJoinStatus((prev) => ({ ...prev, [clubId]: payload.message || "Joined club successfully!" }));
        if (payload.membership) {
          setClubs((prev) => prev.map((c) => (c._id === clubId || c.id === clubId ? { ...c, membership: payload.membership } : c)));
        } else {
          setClubs((prev) => prev.map((c) => (c._id === clubId || c.id === clubId ? { ...c, membership: { role: "member" } } : c)));
        }
      } else {
        setJoinStatus((prev) => ({ ...prev, [clubId]: payload.message || "Failed to join club" }));
      }
    } catch (err) {
      setJoinStatus((prev) => ({ ...prev, [clubId]: "Network error joining club" }));
    } finally {
      setJoiningClubId(null);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      if (!navigator.clipboard) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("Copy failed — please select and copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-[#131712] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">All Clubs</h1>
        <p className="text-gray-400 mb-6">Browse and join investment clubs that match your interests.</p>

        {/* ping status indicator */}
        {pingOk === null ? null : pingOk.ok ? (
          <div className="mb-4 text-sm text-green-300"></div>
        ) : (
          <div className="mb-6 rounded-md border border-red-600 bg-red-900/60 p-4">
            <p className="text-red-400 font-medium">Unexpected token &lt; — response was not JSON</p>
            <pre className="text-xs text-red-200 overflow-x-auto mt-2">
              {pingOk.preview ? pingOk.preview : pingOk.error ? pingOk.error : `Status: ${pingOk.status}`}
            </pre>
            <p className="text-sm text-red-300 mt-2">Tip: if this shows HTML, your frontend may be hitting the SPA (index.html). Ensure <code className="bg-black px-1 rounded">VITE_API_BASE</code> is the backend URL (e.g. http://localhost:3000/api).</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-md border border-red-600 bg-red-900/60 p-4">
            <p className="text-red-400 font-medium">Unexpected token &lt; — response was not JSON</p>
            <pre className="text-xs text-red-200 overflow-x-auto mt-2">{errorMsg}</pre>
            <p className="text-sm text-red-300 mt-2">Tip: check the Network tab for the failing response and ensure your API returns JSON at <code className="bg-black px-1 rounded">/api/clubs</code></p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clubs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, i) => {
              const id = club._id || club.id || club.name;
              return (
                <div key={id} className="bg-[#0d0d0d] p-6 rounded-xl shadow-md hover:bg-[#1a1a1a] transition">
                  <div className="w-full h-32 bg-gray-700 rounded mb-4 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Club Image</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{club.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{club.description || club.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-green-600 rounded-full">{club.category || "General"}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(club._id || club.id || id, id)}
                        className="text-xs px-2 py-1 rounded bg-[#0b0b0b] text-gray-300 hover:text-white"
                        title="Copy club ID"
                      >
                        {copiedId === id ? "Copied" : "Copy ID"}
                      </button>

                      <button
                        onClick={() => navigate(`/clubs/${encodeURIComponent(club._id || club.id || id)}/subscribe`)}
                        className="text-xs bg-[#111] hover:bg-[#1a1a1a] text-white px-3 py-1 rounded"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {club.membership ? (
                      <div className="flex-1 bg-green-500 text-black py-2 rounded-md text-sm font-semibold flex items-center justify-center">
                        Member ({club.membership.role})
                      </div>
                    ) : (
                      <button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-black py-2 rounded-md text-sm font-medium"
                        onClick={() => handleJoinClub(club._id || club.id)}
                        disabled={joiningClubId === (club._id || club.id)}
                      >
                        {joiningClubId === (club._id || club.id) ? "Joining..." : "Join Club"}
                      </button>
                    )}
                    <button
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] text-white py-2 rounded-md text-sm font-medium"
                      onClick={() => navigate(`/clubs/${encodeURIComponent(club._id || club.id || id)}`)}
                    >
                      View Details
                    </button>
                  </div>

                  {joinStatus[club._id || club.id] && (
                    <div className="mt-2 text-yellow-400 text-sm text-center">{joinStatus[club._id || club.id]}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
