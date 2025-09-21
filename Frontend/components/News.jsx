import React, { useState, useEffect } from "react";

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("news");
  const [stockIndexData, setStockIndexData] = useState({
    performance: "+5.2%",
    past3Months: "+1.5%",
    tradingVolume: "+12.8%",
    pastMonth: "+3.2%",
    sentiment: "Bullish"
  });
  const [cryptoData, setCryptoData] = useState({
    bitcoin: { price: "$43,250", change: "+2.1%" },
    ethereum: { price: "$2,650", change: "+1.8%" },
    marketCap: "$1.2T",
    volume24h: "$45.6B"
  });

  // Fetch news from News API based on active tab
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;

        if (!apiKey || apiKey === 'your_news_api_key_here') {
          // Fallback to static data if API key is not set
          const staticNews = getStaticNewsForTab(activeTab);
          setNewsItems(staticNews);
          setError(null);
          return;
        }

        let apiUrl;
        switch (activeTab) {
          case 'news':
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;
            break;
          case 'trends':
            apiUrl = `https://newsapi.org/v2/everything?q=market+trends+stock+market&sortBy=publishedAt&apiKey=${apiKey}`;
            break;
          case 'analysis':
            apiUrl = `https://newsapi.org/v2/everything?q=company+analysis+earnings+financial+results&sortBy=publishedAt&apiKey=${apiKey}`;
            break;
          default:
            apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        setNewsItems(data.articles || []);
        setError(null);
      } catch (err) {
        console.error('News API error:', err);
        setError("Failed to load news. Please try again later.");
        // Fallback to static data on error
        const staticNews = getStaticNewsForTab(activeTab);
        setNewsItems(staticNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeTab]);

  // Fetch stock index data
  useEffect(() => {
    const fetchStockIndexData = async () => {
      try {
        // COMMENTED OUT API CODE - Using static data instead
        /*
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        // Fetch data for Nifty 50 index using proper endpoint
        const response = await fetch(`${import.meta.env.VITE_FASTAPI_STOCK}/indices/IND/NIFTY.NS`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setStockIndexData(prev => ({
            ...prev,
            performance: data.change_percent ? `${data.change_percent > 0 ? '+' : ''}${data.change_percent.toFixed(2)}%` : "+5.2%",
            tradingVolume: data.volume ? `+${(Math.random() * 20).toFixed(1)}%` : "+12.8%"
          }));
        } else {
          console.warn(`Stock index API returned ${response.status}, using fallback data`);
          // Fallback data
          setStockIndexData(prev => ({
            ...prev,
            performance: "+3.2%",
            tradingVolume: "+8.5%"
          }));
        }
        */

        // STATIC DATA INSTEAD OF API CALLS
        const changePercent = (Math.random() - 0.5) * 4; // Random change between -2% and +2%
        const volumeChange = Math.random() * 20 + 5; // Random volume change between 5% and 25%

        setStockIndexData(prev => ({
          ...prev,
          performance: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
          tradingVolume: `+${volumeChange.toFixed(1)}%`
        }));

      } catch (error) {
        console.error('Error with static stock index data:', error);
        // Keep default values if error occurs
        setStockIndexData(prev => ({
          ...prev,
          performance: "+2.8%",
          tradingVolume: "+6.2%"
        }));
      }
    };

    fetchStockIndexData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStockIndexData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // COMMENTED OUT API CODE - Using static data instead
        /*
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        // Fetch Bitcoin data
        const btcResponse = await fetch(`${import.meta.env.VITE_FASTAPI_STOCK}/crypto/quote/BTC`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Fetch Ethereum data
        const ethResponse = await fetch(`${import.meta.env.VITE_FASTAPI_STOCK}/crypto/quote/ETH`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (btcResponse.ok && ethResponse.ok) {
          const btcData = await btcResponse.json();
          const ethData = await ethResponse.json();

          setCryptoData({
            bitcoin: {
              price: btcData.current_price ? `$${btcData.current_price.toLocaleString()}` : "$43,250",
              change: btcData.change_percent ? `${btcData.change_percent > 0 ? '+' : ''}${btcData.change_percent.toFixed(2)}%` : "+2.1%"
            },
            ethereum: {
              price: ethData.current_price ? `$${ethData.current_price.toLocaleString()}` : "$2,650",
              change: ethData.change_percent ? `${ethData.change_percent > 0 ? '+' : ''}${ethData.change_percent.toFixed(2)}%` : "+1.8%"
            },
            marketCap: "$1.2T", // This would need a separate endpoint
            volume24h: "$45.6B" // This would need a separate endpoint
          });
        } else {
          console.warn('Crypto API requests failed, using fallback data');
        }
        */

        // STATIC DATA INSTEAD OF API CALLS
        const btcPrice = Math.floor(Math.random() * 10000 + 35000); // Random BTC price between 35k-45k
        const ethPrice = Math.floor(Math.random() * 1000 + 2200); // Random ETH price between 2.2k-3.2k
        const btcChange = (Math.random() - 0.5) * 6; // Random change between -3% and +3%
        const ethChange = (Math.random() - 0.5) * 6; // Random change between -3% and +3%

        setCryptoData({
          bitcoin: {
            price: `$${btcPrice.toLocaleString()}`,
            change: `${btcChange > 0 ? '+' : ''}${btcChange.toFixed(2)}%`
          },
          ethereum: {
            price: `$${ethPrice.toLocaleString()}`,
            change: `${ethChange > 0 ? '+' : ''}${ethChange.toFixed(2)}%`
          },
          marketCap: "$1.2T",
          volume24h: "$45.6B"
        });

      } catch (error) {
        console.error('Error with static crypto data:', error);
        // Keep default values if error occurs
      }
    };

    fetchCryptoData();
    // Refresh every 2 minutes for crypto (more volatile)
    const interval = setInterval(fetchCryptoData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getStaticNewsForTab = (tab) => {
    switch (tab) {
      case 'news':
        return [
          {
            source: { name: "REUTERS" },
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            title: "Tech Stocks Surge Amidst New Product Launches",
            description: "Reports indicate a significant rise in tech stock values following the unveiling of several innovative products by leading companies.",
            urlToImage: "https://source.unsplash.com/400x200/?technology,news",
            url: "#"
          },
          {
            source: { name: "BLOOMBERG" },
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            title: "Energy Sector Shows Strong Growth",
            description: "The energy sector is experiencing a period of robust growth, driven by increased demand and favorable market conditions.",
            urlToImage: "https://source.unsplash.com/400x200/?energy,news",
            url: "#"
          },
          {
            source: { name: "ASSOCIATED PRESS" },
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            title: "Retail Sales Exceed Expectations",
            description: "Retail sales have surpassed projected figures, signaling a healthy consumer spending trend and economic optimism.",
            urlToImage: "https://source.unsplash.com/400x200/?retail,news",
            url: "#"
          }
        ];
      case 'trends':
        return [
          {
            source: { name: "FINANCIAL TIMES" },
            publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            title: "S&P 500 Reaches New All-Time High",
            description: "The S&P 500 index has reached a new all-time high, driven by strong corporate earnings and positive economic indicators.",
            urlToImage: "https://source.unsplash.com/400x200/?market,trends",
            url: "#"
          },
          {
            source: { name: "WALL STREET JOURNAL" },
            publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            title: "Cryptocurrency Market Shows Signs of Recovery",
            description: "Major cryptocurrencies are showing signs of recovery as institutional adoption increases and regulatory clarity improves.",
            urlToImage: "https://source.unsplash.com/400x200/?crypto,trends",
            url: "#"
          },
          {
            source: { name: "BARRON'S" },
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            title: "Emerging Markets Outperform Developed Markets",
            description: "Emerging market indices have outperformed their developed market counterparts in the past quarter.",
            urlToImage: "https://source.unsplash.com/400x200/?emerging,markets",
            url: "#"
          }
        ];
      case 'analysis':
        return [
          {
            source: { name: "MORGAN STANLEY" },
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            title: "Apple Inc. Q4 Earnings Analysis",
            description: "Apple's latest quarterly results show strong iPhone sales and services growth, with analysts projecting continued momentum.",
            urlToImage: "https://source.unsplash.com/400x200/?apple,analysis",
            url: "#"
          },
          {
            source: { name: "GOLDMAN SACHS" },
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            title: "Tesla's EV Market Position Strengthens",
            description: "Tesla continues to dominate the electric vehicle market with improved margins and expanding production capacity.",
            urlToImage: "https://source.unsplash.com/400x200/?tesla,analysis",
            url: "#"
          },
          {
            source: { name: "JP MORGAN" },
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            title: "Microsoft's Cloud Business Shows Robust Growth",
            description: "Microsoft's Azure cloud platform continues to gain market share with strong enterprise adoption rates.",
            urlToImage: "https://source.unsplash.com/400x200/?microsoft,analysis",
            url: "#"
          }
        ];
      default:
        return [];
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now - published) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Less than 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const filteredNews = newsItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131712] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading {activeTab === 'news' ? 'latest news' : activeTab === 'trends' ? 'market trends' : 'company analysis'}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131712] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-full text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131712] text-white p-8">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">Market News & Analysis</h1>
      <input
        type="text"
        placeholder={`Search ${activeTab === 'news' ? 'news' : activeTab === 'trends' ? 'market trends' : 'company analysis'}`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#0d0d0d] px-4 py-3 rounded-md mb-6 text-sm focus:ring-2 focus:ring-green-500"
      />

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-800 mb-8">
        <button
          className={`pb-2 ${activeTab === 'news' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('news')}
        >
          News Feed
        </button>
        <button
          className={`pb-2 ${activeTab === 'trends' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('trends')}
        >
          Market Trends
        </button>
        <button
          className={`pb-2 ${activeTab === 'analysis' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('analysis')}
        >
          Company Analysis
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Latest News */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">
            {activeTab === 'news' ? 'Latest News' :
              activeTab === 'trends' ? 'Market Trends' : 'Company Analysis'}
          </h2>

          {filteredNews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No {activeTab === 'news' ? 'news' : activeTab === 'trends' ? 'market trends' : 'company analysis'} found matching your search.</p>
            </div>
          ) : (
            filteredNews.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 bg-[#0d0d0d] p-4 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-colors"
                onClick={() => window.open(item.url, '_blank')}
              >
                <img
                  src={item.urlToImage || "https://source.unsplash.com/400x200/?finance,news"}
                  alt={item.title}
                  className="w-28 h-20 object-cover rounded"
                  onError={(e) => {
                    e.target.src = "https://source.unsplash.com/400x200/?finance,news";
                  }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    {item.source.name} • {formatTimeAgo(item.publishedAt)}
                  </p>
                  <h3 className="font-semibold mt-1 hover:text-green-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Market Analysis Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {activeTab === 'news' ? 'Market Overview' :
              activeTab === 'trends' ? 'Trend Indicators' : 'Analysis Insights'}
          </h2>

          {/* Dynamic content based on active tab */}
          {activeTab === 'news' && (
            <>
              {/* Stock Index Performance */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Stock Index Performance</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">{stockIndexData.performance}</h3>
                <p className="text-green-500 text-xs">Past 3 Months {stockIndexData.past3Months}</p>
              </div>

              {/* Trading Volume */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Trading Volume</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">{stockIndexData.tradingVolume}</h3>
                <p className="text-green-500 text-xs">Past Month {stockIndexData.pastMonth}</p>
              </div>

              {/* Bitcoin Price */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Bitcoin (BTC)</p>
                <h3 className="text-2xl font-bold mt-2 text-orange-400">{cryptoData.bitcoin.price}</h3>
                <p className={`text-xs ${cryptoData.bitcoin.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {cryptoData.bitcoin.change}
                </p>
              </div>

              {/* Ethereum Price */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Ethereum (ETH)</p>
                <h3 className="text-2xl font-bold mt-2 text-blue-400">{cryptoData.ethereum.price}</h3>
                <p className={`text-xs ${cryptoData.ethereum.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {cryptoData.ethereum.change}
                </p>
              </div>

              {/* Market Sentiment */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Market Sentiment</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">Bullish</h3>
                <p className="text-green-500 text-xs">Based on recent data</p>
              </div>
            </>
          )}

          {activeTab === 'trends' && (
            <>
              {/* Market Volatility */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Market Volatility</p>
                <h3 className="text-2xl font-bold mt-2 text-yellow-400">Low</h3>
                <p className="text-yellow-500 text-xs">VIX Index: 18.5</p>
              </div>

              {/* Sector Performance */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Top Performing Sector</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">Technology</h3>
                <p className="text-green-500 text-xs">+8.3% this week</p>
              </div>

              {/* Economic Indicators */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Economic Indicators</p>
                <h3 className="text-2xl font-bold mt-2 text-blue-400">Positive</h3>
                <p className="text-blue-500 text-xs">GDP Growth: +2.1%</p>
              </div>
            </>
          )}

          {activeTab === 'analysis' && (
            <>
              {/* Top Gainers */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Top Gainer Today</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">NVDA</h3>
                <p className="text-green-500 text-xs">+15.2% | $875.30</p>
              </div>

              {/* Analyst Ratings */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Analyst Consensus</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">Buy</h3>
                <p className="text-green-500 text-xs">24 of 28 analysts</p>
              </div>

              {/* Earnings Season */}
              <div className="bg-[#0d0d0d] p-6 rounded-lg">
                <p className="text-gray-400 text-sm">Earnings Beat Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-green-400">78%</h3>
                <p className="text-green-500 text-xs">Q3 Results</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
