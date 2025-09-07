import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
);

const ClubDashboard = () => {
    const { clubId } = useParams();
    const [clubData, setClubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('1M');
    const [performanceData, setPerformanceData] = useState({
        '1M': { return: 0, chartData: [] },
        '6M': { return: 0, chartData: [] },
        '1Y': { return: 0, chartData: [] }
    });

    // Fetch club data from backend
    useEffect(() => {
        const fetchClubData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Please log in to view club dashboard');
                    setLoading(false);
                    return;
                }

                // Fetch club details
                const clubResponse = await fetch(`http://localhost:3000/api/clubs/${clubId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!clubResponse.ok) {
                    throw new Error('Failed to fetch club data');
                }

                const club = await clubResponse.json();
                setClubData(club);

                // Extract stock/crypto symbols from club data
                const symbols = club.investmentSymbols && club.investmentSymbols.length > 0
                    ? club.investmentSymbols
                    : ['AAPL', 'GOOGL', 'BTC', 'ETH']; // fallback

                setStockData(symbols);

                // Fetch portfolio data for the club
                const portfolioResponse = await fetch(`http://localhost:3000/api/clubs/${clubId}/portfolio`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (portfolioResponse.ok) {
                    const portfolio = await portfolioResponse.json();
                    // Use symbols from club data for historical data
                    await fetchHistoricalData(symbols);
                } else {
                    // Still fetch historical data even if portfolio fails
                    await fetchHistoricalData(symbols);
                }

            } catch (err) {
                console.error('Error fetching club data:', err);
                setError('Failed to load club dashboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchClubData();
    }, [clubId]);

    const extractSymbolsFromPortfolio = (portfolio) => {
        // Extract unique symbols from portfolio positions
        const symbols = new Set();

        if (portfolio && portfolio.positions) {
            portfolio.positions.forEach(position => {
                if (position.symbol) {
                    symbols.add(position.symbol);
                }
            });
        }

        // If no positions found, use default symbols for demo
        if (symbols.size === 0) {
            return ['AAPL', 'GOOGL', 'BTC', 'ETH'];
        }

        return Array.from(symbols);
    };

    const fetchHistoricalData = async (symbols) => {
        try {
            const periods = ['1M', '6M', '1Y'];
            const periodMappings = {
                '1M': '1mo',
                '6M': '6mo',
                '1Y': '1y'
            };

            const performancePromises = periods.map(async (period) => {
                const periodData = { return: 0, chartData: [] };
                let totalReturn = 0;
                let dataPoints = 0;

                for (const symbol of symbols) {
                    try {
                        const response = await fetch(`/api/stock/historical/${symbol}?period=${periodMappings[period]}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.data && data.data.length > 0) {
                                // Calculate return for this symbol
                                const firstPrice = data.data[0].close;
                                const lastPrice = data.data[data.data.length - 1].close;
                                const symbolReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

                                totalReturn += symbolReturn;
                                dataPoints++;

                                // Add to chart data
                                periodData.chartData.push({
                                    symbol,
                                    data: data.data.map(point => ({
                                        date: new Date(point.timestamp).toLocaleDateString(),
                                        price: point.close
                                    }))
                                });
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching ${symbol} for ${period}:`, error);
                    }
                }

                periodData.return = dataPoints > 0 ? totalReturn / dataPoints : 0;
                return { period, data: periodData };
            });

            const results = await Promise.all(performancePromises);
            const newPerformanceData = {};

            results.forEach(({ period, data }) => {
                newPerformanceData[period] = data;
            });

            setPerformanceData(newPerformanceData);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Use empty data instead of random data
            const newPerformanceData = {};
            ['1M', '6M', '1Y'].forEach(period => {
                newPerformanceData[period] = {
                    return: 0,
                    chartData: []
                };
            });
            setPerformanceData(newPerformanceData);
        }
    };

    // Line Chart Data for selected period
    const lineData = {
        labels: performanceData[selectedPeriod].chartData.length > 0
            ? performanceData[selectedPeriod].chartData[0].data.map(point => point.date)
            : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: performanceData[selectedPeriod].chartData.map((symbolData, index) => ({
            label: symbolData.symbol,
            data: symbolData.data.map(point => point.price),
            borderColor: ["#22c55e", "#16a34a", "#4ade80", "#86efac"][index % 4],
            backgroundColor: ["rgba(34,197,94,0.2)", "rgba(22,163,74,0.2)", "rgba(74,222,128,0.2)", "rgba(134,239,172,0.2)"][index % 4],
            fill: false,
            tension: 0.3,
        })),
    };

    // Pie Chart Data
    const pieData = {
        labels: stockData,
        datasets: [{
            data: stockData.map(() => Math.random() * 100), // Placeholder data
            backgroundColor: ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"],
            borderWidth: 1,
        }],
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#131712] text-white items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <span className="ml-4">Loading club dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#131712] text-white items-center justify-center">
                <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#131712] text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0d0d0d] p-6 flex flex-col justify-between">
                <div>
                    <h1 className="text-xl font-bold mb-8">InvestiClub</h1>
                    <nav className="space-y-4 text-gray-300">
                        <Link to="/dashboard" className="block hover:text-green-500">
                            ← Back to Dashboard
                        </Link>
                        <Link to={`/club/${clubId}/members`} className="block hover:text-green-500">
                            Members
                        </Link>
                        <Link to={`/club/${clubId}/portfolio`} className="block hover:text-green-500">
                            Portfolio
                        </Link>
                        <Link to={`/club/${clubId}/proposals`} className="block hover:text-green-500">
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
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {clubData?.image && (
                            <img
                                src={clubData.image}
                                alt={clubData.name}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">{clubData?.name || 'Club Dashboard'}</h2>
                            <p className="text-gray-400">{clubData?.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-[#1a1a1a] hover:bg-[#222] px-4 py-2 rounded-lg text-sm">
                            🔔
                        </button>
                        <span className="text-white">Club Owner</span>
                    </div>
                </div>

                {/* Performance Period Selector */}
                <div className="flex gap-4 mb-6">
                    {['1M', '6M', '1Y'].map((period) => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedPeriod === period
                                ? 'bg-green-500 text-black'
                                : 'bg-[#1a1a1a] hover:bg-[#222] text-white'
                                }`}
                        >
                            {period} Return: {performanceData[period].return.toFixed(2)}%
                        </button>
                    ))}
                </div>

                {/* Top Section: Charts & Club Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Line Chart */}
                    <div className="bg-[#0d0d0d] p-6 rounded-xl col-span-2">
                        <h3 className="font-semibold mb-4">{selectedPeriod} Performance</h3>
                        <Line data={lineData} />
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-[#0d0d0d] p-6 rounded-xl">
                        <h3 className="font-semibold mb-4">Asset Allocation</h3>
                        <Pie data={pieData} />
                    </div>
                </div>

                {/* Club Summary */}
                <div className="bg-[#0d0d0d] p-6 rounded-xl mb-8">
                    <h3 className="font-semibold mb-4">Club Summary</h3>
                    <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                            <p className="text-gray-400 text-sm">Total Pool</p>
                            <p className="text-lg font-bold">$10,000</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Current Value</p>
                            <p className="text-lg font-bold">$10,500</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Return ({selectedPeriod})</p>
                            <p className="text-green-500 font-bold">{performanceData[selectedPeriod].return.toFixed(2)}%</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Members</p>
                            <p className="text-lg font-bold">5</p>
                        </div>
                    </div>
                </div>

                {/* Current Holdings */}
                <div className="bg-[#0d0d0d] p-6 rounded-xl">
                    <h3 className="font-semibold mb-4">Current Holdings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stockData.map((symbol, index) => (
                            <div key={symbol} className="bg-[#1a1a1a] p-4 rounded-lg">
                                <h4 className="font-medium">{symbol}</h4>
                                <p className="text-green-500 text-sm">+{performanceData[selectedPeriod].return.toFixed(2)}%</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClubDashboard;
