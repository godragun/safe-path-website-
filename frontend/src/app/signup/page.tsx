"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy submit
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Request Access</h1>
          <p className="text-slate-400 text-sm mb-8">Register for SafePath Command clearance</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">FULL NAME / CALLSIGN</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-slate-200 outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">AUTHORIZATION ID (EMAIL)</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-slate-200 outline-none transition-colors"
                placeholder="officer@safepath.gov"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NEW PASSCODE</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-slate-200 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-red-500/20 mt-4">
              Submit Request
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already cleared? <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
