// src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#131712] text-white">
      <div className="max-w-6xl mx-auto p-8">

        {/* Header / Hero */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2">About InvestPlatform</h1>
              <p className="text-gray-400 max-w-2xl">
                We build collaborative investment clubs that let people pool capital, vote on proposals and invest together.
                Our mission is to make collective investing transparent, secure, and accessible.
              </p>
            </div>

            <div className="hidden md:block ">
              <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md text-right">
                <p className="text-sm text-gray-400">Founded</p>
                <p className="font-semibold text-lg">2023</p>

                <div className="mt-4">
                  <p className="text-sm text-gray-400">Active Clubs</p>
                  <p className="font-semibold text-lg">120+</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mission + Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-300 mb-4">
              Empower groups of investors to collaborate, share knowledge and access opportunities normally reserved for institutions.
              We provide tools for governance, transparent accounting, and secure execution so members focus on strategy, not logistics.
            </p>
            <ul className="text-sm text-gray-400 space-y-2">
              <li>• Democratize group investing</li>
              <li>• Build transparent governance tools</li>
              <li>• Deliver secure, auditable workflows</li>
            </ul>
          </div>

          <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p className="text-gray-300">
              A future where anyone can join a community of investors, contribute capital and vote on opportunities — with trust and clarity.
              We imagine vibrant clubs discovering new markets and learning together.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
              <h4 className="font-semibold mb-2">Transparency</h4>
              <p className="text-gray-400 text-sm">All club activity is recorded and auditable — we design for openness.</p>
            </div>
            <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
              <h4 className="font-semibold mb-2">Collaboration</h4>
              <p className="text-gray-400 text-sm">Communities make better decisions together — we build the tools to make it happen.</p>
            </div>
            <div className="bg-[#0d0d0d] p-6 rounded-xl shadow-md">
              <h4 className="font-semibold mb-2">Security</h4>
              <p className="text-gray-400 text-sm">We prioritize safe, auditable flows and protect member funds and data.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0d0d0d] p-6 rounded-xl shadow-md mb-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Ready to start or join a club?</h3>
            <p className="text-gray-400 text-sm">Create a club, invite members, and begin investing together in minutes.</p>
          </div>

          <div className="flex gap-3">
            <Link to="/create-club" className="bg-green-500 hover:bg-green-600 text-black px-5 py-3 rounded-md font-medium">Create a Club</Link>
            <Link to="/clubs" className="bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-3 rounded-md">Browse Clubs</Link>
          </div>
        </section>

        {/* Footer mini */}
        <footer className="text-sm text-gray-400 border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-white font-semibold">InvestPlatform</p>
              <p className="text-gray-500">© {new Date().getFullYear()} InvestPlatform. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
