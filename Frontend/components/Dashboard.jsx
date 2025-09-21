import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { Link, useLocation } from "react-router-dom";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [livePrices, setLivePrices] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view dashboard");
          setLoading(false);
          return;
        }

        // Fetch user's clubs
        const clubsResponse = await fetch("http://localhost:3000/api/clubs/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!clubsResponse.ok) {
          if (clubsResponse.status === 401) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("token");
            return;
          }
          throw new Error("Failed to fetch clubs");
        }

        const clubsData = await clubsResponse.json();
        const clubs = clubsData.clubs || [];

        if (clubs.length === 0) {
          setError("No clubs found. Please create or join a club first.");
          setLoading(false);
          return;
        }

        // Use first club for dashboard
        const club = clubs[0];
        const clubId = club._id;

        // Fetch portfolio
        const portfolioResponse = await fetch(
          `http://localhost:3000/api/clubs/${clubId}/portfolio`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const portfolioData = portfolioResponse.ok
          ? await portfolioResponse.json()
          : { portfolio: [] };

        // Fetch members
        const membersResponse = await fetch(
          `http://localhost:3000/api/clubs/${clubId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const membersData = membersResponse.ok ? await membersResponse.json() : [];

        setDashboardData({
          club,
          portfolio: portfolioData.portfolio || [],
          members: membersData || [],
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch live prices
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (!dashboardData?.club?.investmentSymbols?.length) return;

      try {
        const symbols = dashboardData.club.investmentSymbols.slice(0, 5);

        // COMMENTED OUT API CODE - Using static data instead
        /*
        const pricePromises = symbols.map(async (symbol) => {
          try {
            const response = await fetch(`/api/stock/fetch/${symbol}`);
            if (response.ok) {
              const data = await response.json();
              return {
                symbol,
                name: symbol,
                price: parseFloat(data.price) || 0,
                change: data.change || "N/A",
                marketCap: data.marketCap || "N/A",
              };
            }
          } catch (err) {
            console.error(`Error fetching ${symbol}:`, err);
          }
          return null;
        });

        const prices = (await Promise.all(pricePromises)).filter((p) => p !== null);
        */

        // STATIC DATA INSTEAD OF API CALLS
        const prices = symbols.map((symbol) => {
          const basePrice = Math.random() * 1000 + 100; // Random base price between 100-1100
          const changePercent = (Math.random() - 0.5) * 10; // Random change between -5% and +5%
          const marketCap = Math.floor(Math.random() * 1000000000 + 100000000); // Random market cap

          return {
            symbol,
            name: symbol,
            price: Math.round(basePrice * 100) / 100,
            change: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
            marketCap: `$${(marketCap / 1000000000).toFixed(2)}B`,
          };
        });

        setLivePrices(prices);
      } catch (err) {
        console.error("Error with static live prices:", err);
        setLivePrices([]);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30000);
    return () => clearInterval(interval);
  }, [dashboardData]);

  // Dummy chart data
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Returns",
        data: [10000, 10200, 10150, 10500, 10750, 10600, 10900],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const pieData = {
    labels: ["Stocks", "Crypto", "Real Estate", "Bonds"],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: ["#22c55e", "#16a34a", "#4ade80", "#86efac"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex min-h-screen bg-[#131712] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8">InvestiClub</h1>
          <nav className="space-y-4 text-gray-300">
            <Link
              to="/dashboard"
              className={`block hover:text-green-500 ${location.pathname === "/dashboard" ? "text-green-500" : ""
                }`}
            >
              Dashboard
            </Link>
            <Link
              to={
                dashboardData
                  ? `/club/${dashboardData.club._id}/members`
                  : "/members"
              }
              className={`block hover:text-green-500 ${location.pathname.includes("/members") ? "text-green-500" : ""
                }`}
            >
              Members
            </Link>
            <Link
              to={
                dashboardData
                  ? `/club/${dashboardData.club._id}/portfolio`
                  : "/portfolio"
              }
              className={`block hover:text-green-500 ${location.pathname.includes("/portfolio") ? "text-green-500" : ""
                }`}
            >
              Portfolio
            </Link>
            <Link
              to={
                dashboardData
                  ? `/club/${dashboardData.club._id}/proposals`
                  : "/proposals"
              }
              className={`block hover:text-green-500 ${location.pathname.includes("/proposals") ? "text-green-500" : ""
                }`}
            >
              Proposals
            </Link>
          </nav>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-black py-2 rounded font-medium">
          Contact Support
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Club Overview</h2>
          <div className="flex gap-4">
            <button>🔔</button>
            <span>User</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[#0d0d0d] rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0d0d0d] p-6 rounded-xl col-span-2">
                <h3 className="font-semibold mb-4">Overall Returns</h3>
                <Line data={lineData} />
              </div>
              <div className="bg-[#0d0d0d] p-6 rounded-xl">
                <h3 className="font-semibold mb-4">Portfolio Distribution</h3>
                <Pie data={pieData} />
              </div>
            </div>

            {/* Club Summary */}
            {dashboardData?.club && (
              <div className="bg-[#0d0d0d] p-6 rounded-xl mb-8">
                <h3 className="font-semibold mb-4">Club Summary</h3>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Total Pool</p>
                    <p className="text-lg font-bold">${dashboardData.club.totalValue || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Current Value</p>
                    <p className="text-lg font-bold">${dashboardData.club.currentValue || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Returns</p>
                    <p className="text-green-500 font-bold">+{dashboardData.club.returns || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Members</p>
                    <p className="text-lg font-bold">{dashboardData.members.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Prices */}
            <div className="bg-[#0d0d0d] p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Live Prices</h3>
              {pricesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading prices...</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="pb-2">Asset</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">24h Change</th>
                      <th className="pb-2">Market Cap</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {livePrices.map((asset) => (
                      <tr key={asset.symbol}>
                        <td>{asset.name} ({asset.symbol})</td>
                        <td>${asset.price.toLocaleString()}</td>
                        <td className={asset.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                          {asset.change}
                        </td>
                        <td>{asset.marketCap}</td>
                        <td><button className="px-3 py-1 bg-[#131712] rounded-lg">Trade</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;