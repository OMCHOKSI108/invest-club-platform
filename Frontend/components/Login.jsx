import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        // Trigger navbar update
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => {
          navigate('/dashboard'); // or wherever you want to redirect after login
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#131712" }}
    >
      <div className="bg-[#0d0d0d] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400 mb-6 text-sm">
          Sign in to manage your investments.
        </p>

        {/* Social Buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222] px-4 py-2 rounded-md text-sm text-white">
            <span className="text-lg">G</span> Sign in with Google
          </button>
          <button className="p-2 bg-[#1a1a1a] hover:bg-[#222] rounded-md text-white">
            <span className="text-lg">GH</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="px-2 text-xs text-gray-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        {/* Form */}
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-[#1a1a1a] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm text-gray-300">Password</label>
              <a href="#" className="text-green-500 text-xs">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="•••••••"
                className="w-full bg-[#1a1a1a] text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3 cursor-pointer text-gray-400"
              >
                👁
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black py-2 rounded-full font-medium"
            disabled={loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Footer */}
        <p className="text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
