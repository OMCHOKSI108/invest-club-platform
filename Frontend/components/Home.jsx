import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [showClubInfo, setShowClubInfo] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleCreateClubClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      setShowClubInfo(true);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };
  return (
    <div className="bg-[#131712] text-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Investment Club Platform
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Collaborate, invest, and grow your wealth with like-minded individuals.
          Your journey to financial freedom starts here.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-full font-medium"
            onClick={handleCreateClubClick}
          >
            Create a Club
          </button>
          <button
            className="bg-[#1a1a1a] hover:bg-[#222] text-white px-6 py-2 rounded-full font-medium"
            onClick={() => navigate('/featured-clubs')}
          >
            Join a Club
          </button>
        </div>
      </section>

      {/* Club Information Modal/Section */}
      {showClubInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d0d] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">What is an Investment Club?</h2>
                <button
                  onClick={() => setShowClubInfo(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6 text-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">🎯 What You'll Get</h3>
                    <ul className="space-y-2">
                      <li>• Access to exclusive investment opportunities</li>
                      <li>• Learn from experienced investors</li>
                      <li>• Pool resources for bigger investments</li>
                      <li>• Democratic decision-making process</li>
                      <li>• Professional portfolio management tools</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">💡 How It Works</h3>
                    <ul className="space-y-2">
                      <li>• Create or join an investment club</li>
                      <li>• Set contribution amounts and goals</li>
                      <li>• Vote on investment proposals</li>
                      <li>• Track portfolio performance</li>
                      <li>• Share profits and learn together</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-3">🚀 Benefits of Joining</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📈</div>
                      <h4 className="font-semibold text-white">Higher Returns</h4>
                      <p className="text-sm text-gray-400">Pool resources for premium investments</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎓</div>
                      <h4 className="font-semibold text-white">Learn & Grow</h4>
                      <p className="text-sm text-gray-400">Gain investment knowledge from peers</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🤝</div>
                      <h4 className="font-semibold text-white">Community</h4>
                      <p className="text-sm text-gray-400">Connect with like-minded investors</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-3">✨ Ready to Start Your Investment Journey?</h3>
                  <p className="text-gray-300 mb-4">
                    {isLoggedIn
                      ? "You're already part of our community! Create your own club or join existing ones to start investing."
                      : "Join thousands of investors who are already building wealth together. Create your club today and start making smarter investment decisions."
                    }
                  </p>
                  {isLoggedIn ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-green-500 hover:bg-green-600 text-black px-6 py-3 rounded-full font-medium text-lg flex-1"
                      >
                        Go to Dashboard
                      </button>
                      <button
                        onClick={() => navigate('/featured-clubs')}
                        className="bg-[#1a1a1a] hover:bg-[#222] text-white px-6 py-3 rounded-full font-medium text-lg flex-1"
                      >
                        Browse Clubs
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleSignupClick}
                      className="bg-green-500 hover:bg-green-600 text-black px-8 py-3 rounded-full font-medium text-lg w-full"
                    >
                      Sign Up & Create Your Club
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <section className="py-16 px-6 bg-[#0d0d0d] text-center">
        <h2 className="text-2xl font-bold mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
          {[
            { title: "Create a Club", desc: "Form your own investment group & set financial goals." },
            { title: "Contribute Funds", desc: "Pool resources securely for maximum market impact." },
            { title: "Vote on Proposals", desc: "Engage in governance by voting on club initiatives." },
            { title: "Execute Investments", desc: "Deploy funds into diversified strategies efficiently." },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-500 text-black rounded-full flex items-center justify-center font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">
          Featured Clubs & Opportunities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {["Future Tech Innovators", "Green Energy Fund", "Global Growth Seekers"].map((club, i) => (
            <div key={i} className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
              <img
                src={`https://source.unsplash.com/400x200/?${encodeURIComponent(club)}`}
                alt={club}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h3 className="font-semibold mb-2">{club}</h3>
              <p className="text-gray-400 text-sm">
                Explore opportunities in {club.toLowerCase()} markets.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-6 bg-[#0d0d0d]">
        <h2 className="text-2xl font-bold text-center mb-10">
          Latest News & Market Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="bg-[#131712] p-6 rounded-xl shadow-md flex gap-4">
            <div className="w-40 h-28 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500">Image</span>
            </div>
            <div>
              <p className="text-green-400 text-xs mb-1">Crypto • 5 min read</p>
              <h3 className="font-semibold mb-2">
                The Rise of Decentralized Finance (DeFi)
              </h3>
              <p className="text-gray-400 text-sm">
                Discover how decentralized finance is reshaping global
                investment strategies.
              </p>
            </div>
          </div>
          <div className="bg-[#131712] p-6 rounded-xl shadow-md flex gap-4">
            <div className="w-40 h-28 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500">Image</span>
            </div>
            <div>
              <p className="text-green-400 text-xs mb-1">
                Economy • 3 min read
              </p>
              <h3 className="font-semibold mb-2">
                Navigating Inflation: Strategies for Investors
              </h3>
              <p className="text-gray-400 text-sm">
                Learn practical steps investors can take to hedge against
                inflation risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0d0d] py-10 px-6 text-gray-400 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div>
            <h4 className="text-white font-semibold mb-3">InvestPlatform</h4>
            <p>Empowering collaboration and growth for every investor.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-1">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Disclaimer</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">
          © 2025 InvestPlatform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
