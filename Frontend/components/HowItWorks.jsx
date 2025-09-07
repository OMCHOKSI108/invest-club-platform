import React from "react";

const HowItWorks = () => {
    const steps = [
        {
            step: 1,
            title: "Create or Join a Club",
            description: "Start by creating your own investment club or join an existing one that matches your investment goals and risk tolerance.",
            icon: "👥"
        },
        {
            step: 2,
            title: "Pool Resources",
            description: "Members contribute funds to a shared pool, allowing for larger investments and better diversification across various assets.",
            icon: "💰"
        },
        {
            step: 3,
            title: "Propose Investments",
            description: "Club members can propose investment opportunities, from stocks and crypto to real estate and commodities.",
            icon: "📈"
        },
        {
            step: 4,
            title: "Vote on Decisions",
            description: "Democratic voting ensures all members have a say in investment decisions, promoting transparency and collective wisdom.",
            icon: "🗳️"
        },
        {
            step: 5,
            title: "Track Performance",
            description: "Monitor your club's performance with detailed analytics, portfolio tracking, and regular reporting.",
            icon: "📊"
        },
        {
            step: 6,
            title: "Share Profits",
            description: "Profits and losses are distributed among members according to their contribution and club agreements.",
            icon: "🎯"
        }
    ];

    return (
        <div className="min-h-screen bg-[#131712] text-white">
            {/* Hero Section */}
            <section className="text-center py-20 px-6">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    How It Works
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                    Discover the simple yet powerful process of collaborative investing through our investment club platform.
                </p>
            </section>

            {/* Steps Section */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <div key={step.step} className="bg-[#0d0d0d] p-6 rounded-xl hover:bg-[#1a1a1a] transition-colors">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-3xl">{step.icon}</div>
                                    <div className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center font-bold text-sm">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-6 bg-[#0d0d0d]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Why Choose Investment Clubs?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="text-left">
                            <h3 className="text-xl font-semibold mb-4 text-green-400">For Individual Investors</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li>• Access to larger investment opportunities</li>
                                <li>• Shared research and due diligence costs</li>
                                <li>• Learn from experienced investors</li>
                                <li>• Diversify with smaller capital</li>
                            </ul>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-semibold mb-4 text-green-400">For Investment Clubs</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li>• Streamlined club management</li>
                                <li>• Transparent voting and governance</li>
                                <li>• Real-time portfolio tracking</li>
                                <li>• Secure fund management</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-gray-400 mb-8">
                        Join thousands of investors who are already building wealth together through collaborative investing.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-green-500 hover:bg-green-600 text-black px-8 py-3 rounded-full font-medium">
                            Create a Club
                        </button>
                        <button className="bg-[#1a1a1a] hover:bg-[#222] text-white px-8 py-3 rounded-full font-medium">
                            Browse Clubs
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
