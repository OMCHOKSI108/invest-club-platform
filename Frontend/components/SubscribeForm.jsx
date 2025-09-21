// src/components/SubscribeForm.jsx
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";

/**
 * Dynamic SubscribeForm
 * - clubId (string) optional (but required by server)
 * - fetchSubscriptions (optional async fn) receives clubId and returns array of subs
 * - onSubscribed (optional fn) callback receives the created subscription
 */
export default function SubscribeForm({ clubId: propClubId, fetchSubscriptions, onSubscribed }) {
  const [clubId, setClubId] = useState(propClubId || "");
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_APP_API_BASE ||
    "http://localhost:3000/api";

  useEffect(() => {
    setClubId(propClubId || "");
  }, [propClubId]);

  // Optional: load existing subscriptions for the club if fetchSubscriptions provided
  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!clubId || typeof fetchSubscriptions !== "function") return;
      setLoadingSubs(true);
      try {
        const list = await fetchSubscriptions(clubId);
        if (mounted) setSubscriptions(Array.isArray(list) ? list : []);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingSubs(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [clubId, fetchSubscriptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!clubId) {
      setErrorMsg("clubId is missing. Pass <SubscribeForm clubId={club._id} /> or use the Club subscribe route.");
      return;
    }
    if (!symbol || !symbol.trim()) {
      setErrorMsg("Please enter a symbol (e.g. BTC, AAPL).");
      return;
    }

    const normalized = symbol.trim().toUpperCase();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/market/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ clubId, symbol: normalized }),
      });

      const text = await res.text();
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { message: text };
      }

      if (res.ok) {
        const created = payload.subscription ?? payload ?? { id: Date.now().toString(), symbol: normalized, createdAt: new Date().toISOString() };
        setSubscriptions((prev) => [created, ...prev]);
        setSuccessMsg(payload.message || "Subscribed successfully");
        setSymbol("");
        if (typeof onSubscribed === "function") onSubscribed(created);
      } else {
        const serverMsg = payload.message || (payload.errors ? JSON.stringify(payload.errors) : text.slice(0, 400));
        setErrorMsg(serverMsg);
      }
    } catch (err) {
      setErrorMsg("Network error: " + (err.message || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#050505] to-[#0a0a0a] p-6">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shadow-sm">
              <Bell className="text-black" size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Market Subscription</h3>
              <p className="text-xs text-gray-400">Subscribe to symbol alerts for this club.</p>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-300 mb-2 block">Club ID</label>
            <div className="flex gap-2">
              <input
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                placeholder="Paste clubId here or pass via prop"
                className="flex-1 bg-[#111] text-white px-3 py-2 rounded-md text-sm border border-transparent focus:border-green-500"
              />
              <button
                type="button"
                onClick={() => setClubId("")}
                className="px-3 py-2 rounded-md bg-[#1a1a1a] hover:bg-[#222] text-white text-sm"
                title="Clear clubId"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Server requires a valid clubId to create subscriptions.</p>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-300 mb-2 block">Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. BTC, AAPL"
              className="w-full bg-[#111] text-white px-3 py-2 rounded-md text-sm border border-transparent focus:border-green-500"
            />
          </div>

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-full text-black font-semibold transition shadow-md ${loading ? "bg-green-400/70 cursor-not-allowed" : "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600"
                }`}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>

            <button
              type="button"
              onClick={() => { setSymbol(""); setErrorMsg(""); setSuccessMsg(""); }}
              className="px-4 py-2 rounded-full bg-[#121212] text-white text-sm border border-gray-800 hover:bg-[#1a1a1a]"
            >
              Clear
            </button>
          </div>

          <div className="mt-4">
            {errorMsg && <div className="text-sm text-red-400">{errorMsg}</div>}
            {successMsg && <div className="text-sm text-green-300">{successMsg}</div>}
          </div>
        </form>

        <div className="mt-6 bg-[#0b0b0b] border border-gray-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm text-gray-200 font-semibold">Your Subscriptions</h4>
            <span className="text-xs text-gray-500">{subscriptions.length} items</span>
          </div>

          {loadingSubs ? (
            <div className="py-6 text-center text-gray-400">Loading subscriptions…</div>
          ) : subscriptions.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No subscriptions yet. Subscribe to a symbol above.</div>
          ) : (
            <ul className="space-y-2">
              {subscriptions.map((s) => (
                <li key={s.id || s._id} className="flex items-center justify-between bg-[#080808] p-3 rounded-md border border-gray-900">
                  <div>
                    <div className="text-sm font-medium text-white">{s.symbol}</div>
                    <div className="text-xs text-gray-500">Subscribed • {new Date(s.createdAt || s.createdAtAt || Date.now()).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs text-gray-400">alerts</div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-gray-500 mt-3">Manage subscriptions from your club dashboard.</p>
        </div>
      </div>
    </div>
  );
}
