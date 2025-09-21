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

                // Fetch historical data
                await fetchHistoricalData(symbols);

            } catch (err) {
                console.error('Error fetching club data:', err);
                setError('Failed to load club dashboard. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchClubData();
    }, [clubId]);

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
                        // COMMENTED OUT API CODE - Using static data instead
                        /*
                        // Create AbortController for timeout
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                        // List of known Indian stock symbols (with .NS suffix as used in API)
                        const indianStocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'HINDUNILVR.NS', 'INFY.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'BAJFINANCE.NS', 'LT.NS', 'HCLTECH.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'AXISBANK.NS', 'WIPRO.NS', 'ULTRACEMCO.NS', 'TITAN.NS', 'NESTLEIND.NS', 'SUNPHARMA.NS', 'POWERGRID.NS', 'TECHM.NS', 'M&M.NS', 'NTPC.NS', 'TATAMOTORS.NS', 'BAJAJFINSV.NS', 'JSWSTEEL.NS', 'INDUSINDBK.NS', 'GRASIM.NS', 'ADANIENT.NS', 'COALINDIA.NS', 'CIPLA.NS', 'DRREDDY.NS', 'EICHERMOT.NS', 'ONGC.NS', 'BRITANNIA.NS', 'DIVISLAB.NS', 'TATACONSUM.NS', 'BAJAJ-AUTO.NS', 'APOLLOHOSP.NS', 'HINDALCO.NS', 'HEROMOTOCO.NS', 'UPL.NS', 'ADANIPORTS.NS', 'GODREJCP.NS', 'PIDILITIND.NS', 'BANDHANBNK.NS', 'BERGEPAINT.NS', 'COLPAL.NS', 'DABUR.NS', 'HAVELLS.NS', 'MARICO.NS', 'SRF.NS', 'VOLTAS.NS', 'SIEMENS.NS', 'BAJAJHLDNG.NS', 'DLF.NS', 'GAIL.NS', 'JINDALSTEL.NS', 'MOTHERSON.NS', 'PAGEIND.NS', 'TORNTPHARM.NS', 'AMBUJACEM.NS', 'BANKBARODA.NS', 'BPCL.NS', 'CADILAHC.NS', 'CANBK.NS', 'CONCOR.NS', 'CUB.NS', 'FEDERALBNK.NS', 'GUJGASLTD.NS', 'HDFCLIFE.NS', 'HDFC.NS', 'IBULHSGFIN.NS', 'ICICIPRULI.NS', 'INDIGO.NS', 'IOC.NS', 'LUPIN.NS', 'MCDOWELL-N.NS', 'NMDC.NS', 'PETRONET.NS', 'PFC.NS', 'RECLTD.NS', 'SAIL.NS', 'SHREECEM.NS', 'SBILIFE.NS', 'TATACHEM.NS', 'TATAPOWER.NS', 'TATASTEEL.NS', 'VEDL.NS', 'ZEEL.NS', 'ACC.NS', 'AUROPHARMA.NS', 'BIOCON.NS', 'BOSCHLTD.NS', 'ESCORTS.NS', 'EXIDEIND.NS', 'HINDZINC.NS', 'IBVENTURES.NS', 'LICHSGFIN.NS', 'MANAPPURAM.NS', 'MRF.NS', 'PEL.NS', 'PFIZER.NS', 'PNB.NS', 'RBLBANK.NS', 'SRTRANSFIN.NS', 'TVSMOTOR.NS', 'UNIONBANK.NS', 'YESBANK.NS', 'ABCAPITAL.NS', 'ALKEM.NS', 'APLLTD.NS', 'ASHOKLEY.NS', 'AIAENG.NS', 'BEL.NS', 'BHARATFORG.NS', 'CESC.NS', 'CHOLAFIN.NS', 'CROMPTON.NS', 'DELTACORP.NS', 'DIXON.NS', 'EQUITAS.NS', 'FORTIS.NS', 'FSL.NS', 'GMRINFRA.NS', 'GRAPHITE.NS', 'HATHWAY.NS', 'IDFCFIRSTB.NS', 'INOXLEISUR.NS', 'IGL.NS', 'ISEC.NS', 'JKCEMENT.NS', 'KEI.NS', 'L&TFH.NS', 'LALPATHLAB.NS', 'MINDTREE.NS', 'MPHASIS.NS', 'NATIONALUM.NS', 'NAVINFLUOR.NS', 'NHPC.NS', 'NIITLTD.NS', 'OBEROIRLTY.NS', 'PERSISTENT.NS', 'POLYCAB.NS', 'PVR.NS', 'RAMCOCEM.NS', 'RAYMOND.NS', 'RELAXO.NS', 'RENUKA.NS', 'SHRIRAMFIN.NS', 'SOBHA.NS', 'SOLARINDS.NS', 'SPARC.NS', 'SUNTV.NS', 'SUPREMEIND.NS', 'SYNGENE.NS', 'TANLA.NS', 'TEAMLEASE.NS', 'THERMAX.NS', 'TV18BRDCST.NS', 'TVSMOTOR.NS', 'UNIONBANK.NS', 'VAKRANGEE.NS', 'VINATIORGA.NS', 'VIPIND.NS', 'VTL.NS', 'WELCORP.NS', 'WHIRLPOOL.NS', 'YESBANK.NS', 'ZENSARTECH.NS'];
                        const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'UNI', 'AAVE', 'COMP', 'MKR', 'SUSHI', 'LINK', 'CRV', 'YFI'];
                        const usStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'AVGO', 'LLY', 'JPM', 'UNH', 'XOM', 'JNJ', 'V', 'PG', 'MA', 'HD', 'CVX', 'ABBV', 'BAC', 'PFE', 'KO', 'ASML', 'MRK', 'COST', 'PEP', 'TMO', 'WMT', 'CSCO', 'ABT', 'DIS', 'CRM', 'ACN', 'DHR', 'VZ', 'ADBE', 'NKE', 'TXN', 'NEE', 'MCD', 'RTX', 'QCOM', 'WFC', 'PM', 'BMY', 'UPS', 'AMGN', 'HON', 'T', 'SPGI', 'LOW', 'COP', 'GS', 'SBUX', 'UNP', 'ELV', 'DE', 'INTU', 'CAT', 'AMD', 'AXP', 'BKNG', 'GILD', 'MS', 'BA', 'MDT', 'TJX', 'SCHW', 'PLD', 'SYK', 'BLK', 'ADI', 'TMUS', 'AMT', 'CVS', 'MU', 'CI', 'SO', 'VRTX', 'NFLX', 'INTC', 'PYPL', 'CMCSA'];

                        // Determine if it's Indian or US stock and use appropriate endpoint
                        let apiUrl;
                        if (indianStocks.includes(symbol)) {
                            // Indian stock - use quote endpoint
                            apiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/stocks/quote/IND/${symbol}`;
                        } else if (cryptoSymbols.includes(symbol)) {
                            // Crypto
                            apiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/crypto/quote/${symbol}`;
                        } else {
                            // US stock - use quote endpoint
                            apiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/stocks/quote/US/${symbol}`;
                        }
                        // Determine if it's Indian or US stock and use appropriate historical endpoint
                        let historicalApiUrl;
                        if (indianStocks.includes(symbol)) {
                            // Indian stock - historical API expects .NS suffix
                            historicalApiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/stocks/historical/IND/${symbol}?period=${periodMappings[period]}`;
                        } else if (cryptoSymbols.includes(symbol)) {
                            // Crypto - use crypto historical endpoint
                            historicalApiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/crypto/historical/${symbol}?period=${periodMappings[period]}`;
                        } else {
                            // US stock
                            historicalApiUrl = `${import.meta.env.VITE_FASTAPI_STOCK}/stocks/historical/US/${symbol}?period=${periodMappings[period]}`;
                        }

                        const historicalResponse = await fetch(historicalApiUrl, {
                            signal: controller.signal,
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });

                        clearTimeout(timeoutId);

                        if (historicalResponse.ok) {
                            const historicalData = await historicalResponse.json();

                            if (historicalData && historicalData.historical_data && historicalData.historical_data.length > 0) {
                                // Use real historical data
                                const processedData = historicalData.historical_data.map(point => ({
                                    date: new Date(point.date).toLocaleDateString(),
                                    price: point.close || point.price
                                }));

                                // Calculate return
                                const firstPrice = processedData[0].price;
                                const lastPrice = processedData[processedData.length - 1].price;
                                const symbolReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

                                totalReturn += symbolReturn;
                                dataPoints++;

                                // Add to chart data
                                periodData.chartData.push({
                                    symbol,
                                    data: processedData
                                });
                            } else {
                                console.warn(`No historical data for ${symbol}, using fallback`);
                                await generateFallbackData(symbol, period, periodData);
                            }
                        } else {
                            console.warn(`Historical API returned ${historicalResponse.status} for ${symbol}, using fallback`);
                            await generateFallbackData(symbol, period, periodData);
                        }
                        */

                        // STATIC DATA INSTEAD OF API CALLS
                        const generateStaticData = (symbol, period) => {
                            const basePrice = Math.random() * 1000 + 100; // Random base price between 100-1100
                            const volatility = Math.random() * 0.3 + 0.1; // Random volatility 10-40%
                            const dataPoints = period === '1M' ? 30 : period === '6M' ? 180 : 365; // Days based on period

                            const data = [];
                            let currentPrice = basePrice;

                            for (let i = dataPoints; i >= 0; i--) {
                                const date = new Date();
                                date.setDate(date.getDate() - i);
                                const change = (Math.random() - 0.5) * volatility * currentPrice;
                                currentPrice += change;
                                currentPrice = Math.max(currentPrice, 1); // Ensure positive price

                                data.push({
                                    date: date.toLocaleDateString(),
                                    price: Math.round(currentPrice * 100) / 100
                                });
                            }

                            return data;
                        };

                        const processedData = generateStaticData(symbol, period);

                        // Calculate return
                        const firstPrice = processedData[0].price;
                        const lastPrice = processedData[processedData.length - 1].price;
                        const symbolReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

                        totalReturn += symbolReturn;
                        dataPoints++;

                        // Add to chart data
                        periodData.chartData.push({
                            symbol,
                            data: processedData
                        });

                    } catch (error) {
                        console.error(`Error processing ${symbol}:`, error);
                        // Generate fallback data for errors
                        const generateFallbackData = (symbol, period, periodData) => {
                            const basePrice = Math.random() * 500 + 50;
                            const dataPoints = period === '1M' ? 30 : period === '6M' ? 180 : 365;

                            const data = [];
                            for (let i = 0; i < dataPoints; i++) {
                                const date = new Date();
                                date.setDate(date.getDate() - (dataPoints - i));
                                data.push({
                                    date: date.toLocaleDateString(),
                                    price: basePrice + Math.sin(i * 0.1) * 20 + Math.random() * 10
                                });
                            }

                            const firstPrice = data[0].price;
                            const lastPrice = data[data.length - 1].price;
                            const symbolReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

                            periodData.return += symbolReturn;
                            periodData.chartData.push({
                                symbol,
                                data: data
                            });
                        };

                        generateFallbackData(symbol, period, periodData);
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

    // Helper function to generate fallback data when API fails
    const generateFallbackData = async (symbol, period, periodData) => {
        try {
            const numPoints = period === '1M' ? 30 : period === '6M' ? 180 : 365;
            const mockData = [];
            let price = 100 + Math.random() * 200; // Random starting price between 100-300

            for (let i = 0; i < numPoints; i++) {
                price += (Math.random() - 0.5) * price * 0.02; // Small daily changes
                mockData.push({
                    date: new Date(Date.now() - (numPoints - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    price: Math.max(price, 0.01)
                });
            }

            periodData.chartData.push({
                symbol,
                data: mockData
            });
        } catch (error) {
            console.error(`Error generating fallback data for ${symbol}:`, error);
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

    // Line Chart Options
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff',
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#22c55e',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#333333'
                },
                ticks: {
                    color: '#cccccc'
                }
            },
            y: {
                grid: {
                    color: '#333333'
                },
                ticks: {
                    color: '#cccccc',
                    callback: function (value) {
                        return '$' + value.toFixed(2);
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6
            }
        }
    };

    // Pie Chart Options
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#ffffff',
                    font: {
                        size: 12
                    },
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#22c55e',
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${percentage}% ($${context.parsed.toFixed(2)})`;
                    }
                }
            }
        }
    };

    // Pie Chart Data - Asset Allocation
    const pieData = {
        labels: ['US Stocks', 'Indian Stocks', 'Cryptocurrency'],
        datasets: [{
            data: [
                stockData.filter(symbol => !indianStocks.includes(symbol) && !cryptoSymbols.includes(symbol)).length * 25, // US stocks
                stockData.filter(symbol => indianStocks.includes(symbol)).length * 25, // Indian stocks
                stockData.filter(symbol => cryptoSymbols.includes(symbol)).length * 25  // Crypto
            ],
            backgroundColor: [
                '#3b82f6', // Blue for US stocks
                '#f59e0b', // Orange for Indian stocks
                '#10b981'  // Green for crypto
            ],
            borderColor: [
                '#1e40af',
                '#d97706',
                '#059669'
            ],
            borderWidth: 2
        }]
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
                        <div className="h-64">
                            <Line data={lineData} options={lineOptions} />
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-[#0d0d0d] p-6 rounded-xl">
                        <h3 className="font-semibold mb-4">Asset Allocation</h3>
                        <div className="h-64">
                            <Pie data={pieData} options={pieOptions} />
                        </div>
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
                        {stockData.map((symbol) => (
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
