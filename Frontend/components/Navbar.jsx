import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const currentToken = localStorage.getItem('token');
      setIsLoggedIn(!!currentToken);
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);

    // Also listen for custom auth events
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };
  return (
    <header
      className="bg-[#0d0d0d] text-white px-6 py-4 flex justify-between items-center"
      style={{ backgroundColor: "#131712" }}
    >
      {/* Logo + Brand */}
      <Link to="/" className="flex items-center gap-2 font-bold text-lg" style={{ textDecoration: 'none' }}>
        <div className="w-5 h-5 bg-green-500 rounded-sm" />
        InvestPlatform
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex gap-8 text-sm font-medium">
        <Link to="/" className="hover:text-green-400">
          Home
        </Link>
        {isLoggedIn && (
          <Link to="/dashboard" className="hover:text-green-400">
            Dashboard
          </Link>
        )}
        <Link to="/how-it-works" className="hover:text-green-400">
          How it Works
        </Link>
        <Link to="/featured-clubs" className="hover:text-green-400">
          Featured Clubs
        </Link>
        <Link to="/news" className="hover:text-green-400">
          News
        </Link>
      </nav>

      {/* Right Buttons */}
      <div className="flex gap-3">
        {isLoggedIn ? (
          <>
            <button className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 py-1.5 rounded-full text-sm font-medium">
              🔔
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">Welcome</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-[#1a1a1a] hover:bg-[#222] text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-1.5 rounded-full text-sm font-medium"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
