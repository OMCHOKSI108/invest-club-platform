import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FeaturedClubs = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All Clubs");

    // Fetch clubs from backend
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                // Try to fetch from backend first
                if (token) {
                    const response = await fetch('http://localhost:3000/api/clubs/featured', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const clubsData = await response.json();
                        const transformedClubs = clubsData.map((club) => ({
                            id: club._id,
                            name: club.name,
                            description: club.description || "A great investment club for growing wealth together.",
                            members: Math.floor(Math.random() * 200) + 50, // Mock data
                            totalValue: `$${(Math.random() * 5 + 1).toFixed(1)}M`, // Mock data
                            monthlyReturn: `+${(Math.random() * 20 + 5).toFixed(1)}%`, // Mock data
                            riskLevel: ["Low", "Medium", "High", "Very High"][Math.floor(Math.random() * 4)],
                            category: ["Technology", "Energy", "Real Estate", "Cryptocurrency", "Commodities"][Math.floor(Math.random() * 5)],
                            image: `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`
                        }));
                        setClubs(transformedClubs);
                        setError(null);
                        return;
                    }
                }

                // Fallback to static data
                const staticClubs = [
                    {
                        id: 1,
                        name: "Tech Innovators Club",
                        description: "Focused on cutting-edge technology investments including AI, blockchain, and emerging tech startups.",
                        members: 156,
                        totalValue: "$2.4M",
                        monthlyReturn: "+12.5%",
                        riskLevel: "High",
                        category: "Technology",
                        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 2,
                        name: "Green Energy Collective",
                        description: "Investing in renewable energy, sustainable infrastructure, and clean technology solutions.",
                        members: 89,
                        totalValue: "$1.8M",
                        monthlyReturn: "+8.2%",
                        riskLevel: "Medium",
                        category: "Energy",
                        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 3,
                        name: "Real Estate Partners",
                        description: "Commercial and residential real estate investments with focus on emerging markets.",
                        members: 234,
                        totalValue: "$5.1M",
                        monthlyReturn: "+6.8%",
                        riskLevel: "Medium",
                        category: "Real Estate",
                        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 4,
                        name: "Crypto Pioneers",
                        description: "Digital asset investments including Bitcoin, Ethereum, and promising altcoins.",
                        members: 67,
                        totalValue: "$950K",
                        monthlyReturn: "+24.1%",
                        riskLevel: "Very High",
                        category: "Cryptocurrency",
                        image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 5,
                        name: "Dividend Aristocrats",
                        description: "Blue-chip companies with consistent dividend payments and long-term growth potential.",
                        members: 178,
                        totalValue: "$3.2M",
                        monthlyReturn: "+4.9%",
                        riskLevel: "Low",
                        category: "Technology",
                        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 6,
                        name: "Global Commodities",
                        description: "Diversified commodity investments including gold, oil, agricultural products, and metals.",
                        members: 145,
                        totalValue: "$2.9M",
                        monthlyReturn: "+7.3%",
                        riskLevel: "Medium",
                        category: "Commodities",
                        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 7,
                        name: "AI & Machine Learning",
                        description: "Investing in artificial intelligence, machine learning, and automation technologies.",
                        members: 92,
                        totalValue: "$1.6M",
                        monthlyReturn: "+15.2%",
                        riskLevel: "High",
                        category: "Technology",
                        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 8,
                        name: "Solar & Wind Energy",
                        description: "Clean energy investments in solar panels, wind farms, and renewable infrastructure.",
                        members: 134,
                        totalValue: "$2.1M",
                        monthlyReturn: "+9.8%",
                        riskLevel: "Medium",
                        category: "Energy",
                        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 9,
                        name: "Commercial Real Estate",
                        description: "Office buildings, retail spaces, and industrial properties in prime locations.",
                        members: 187,
                        totalValue: "$4.2M",
                        monthlyReturn: "+7.1%",
                        riskLevel: "Medium",
                        category: "Real Estate",
                        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 10,
                        name: "DeFi & Web3",
                        description: "Decentralized finance, NFTs, and Web3 infrastructure investments.",
                        members: 78,
                        totalValue: "$1.2M",
                        monthlyReturn: "+28.5%",
                        riskLevel: "Very High",
                        category: "Cryptocurrency",
                        image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 11,
                        name: "Precious Metals",
                        description: "Gold, silver, platinum, and other precious metal investments.",
                        members: 156,
                        totalValue: "$3.8M",
                        monthlyReturn: "+5.4%",
                        riskLevel: "Low",
                        category: "Commodities",
                        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop&crop=center"
                    },
                    {
                        id: 12,
                        name: "Oil & Gas Select",
                        description: "Carefully selected oil and gas investments with ESG considerations.",
                        members: 98,
                        totalValue: "$2.7M",
                        monthlyReturn: "+11.2%",
                        riskLevel: "High",
                        category: "Energy",
                        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop&crop=center"
                    }
                ];
                setClubs(staticClubs);
                setError(null);
            } catch (err) {
                console.error('Error fetching clubs:', err);
                setError('Failed to load clubs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    const getRiskColor = (risk) => {
        switch (risk) {
            case "Low": return "text-green-400";
            case "Medium": return "text-yellow-400";
            case "High": return "text-orange-400";
            case "Very High": return "text-red-400";
            default: return "text-gray-400";
        }
    };

    const filteredClubs = selectedCategory === "All Clubs"
        ? clubs
        : clubs.filter(club => {
            if (selectedCategory === "Crypto") return club.category === "Cryptocurrency";
            return club.category === selectedCategory;
        });

    return (
        <div className="min-h-screen bg-[#131712] text-white">
            {/* Hero Section */}
            <section className="text-center py-20 px-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    Featured Clubs
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    Discover top-performing investment clubs and find the perfect community to grow your wealth with.
                </p>
                <div className="flex justify-center gap-4 mb-8">
                    <button className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-full font-medium">
                        Create Your Club
                    </button>
                    <Link to="/clubs" className="bg-[#1a1a1a] hover:bg-[#222] text-white px-6 py-2 rounded-full font-medium">
                        Browse All Clubs
                    </Link>
                </div>
            </section>

            {/* Filters */}
            <section className="px-6 pb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-4 justify-center">
                        {["All Clubs", "Technology", "Energy", "Real Estate", "Crypto", "Commodities"].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? "bg-green-500 text-black"
                                    : "bg-[#1a1a1a] hover:bg-[#222] text-white"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clubs Grid */}
            <section className="px-6 pb-16">
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-md mb-6 text-center">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading clubs...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClubs.map((club) => (
                                <div key={club.id} className="bg-[#0d0d0d] rounded-xl overflow-hidden hover:bg-[#1a1a1a] transition-colors">
                                    <img
                                        src={club.image}
                                        alt={club.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-semibold">{club.name}</h3>
                                            <span className={`text-sm font-medium ${getRiskColor(club.riskLevel)}`}>
                                                {club.riskLevel} Risk
                                            </span>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {club.description}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-gray-500 text-xs">Members</p>
                                                <p className="text-white font-semibold">{club.members}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs">Total Value</p>
                                                <p className="text-white font-semibold">{club.totalValue}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <p className="text-gray-500 text-xs">Monthly Return</p>
                                                <p className="text-green-400 font-semibold">{club.monthlyReturn}</p>
                                            </div>
                                            <span className="text-xs bg-[#1a1a1a] px-2 py-1 rounded-full">
                                                {club.category}
                                            </span>
                                        </div>

                                        <Link
                                            to={`/club/${club.id}`}
                                            className="w-full bg-green-500 hover:bg-green-600 text-black py-2 rounded-full font-medium text-sm text-center block"
                                        >
                                            View Club
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-[#0d0d0d]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Platform Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-2">1,247</div>
                            <div className="text-gray-400 text-sm">Active Clubs</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-2">15,632</div>
                            <div className="text-gray-400 text-sm">Total Members</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-2">$127M</div>
                            <div className="text-gray-400 text-sm">Assets Under Management</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-green-400 mb-2">+14.2%</div>
                            <div className="text-gray-400 text-sm">Avg. Annual Return</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FeaturedClubs;
