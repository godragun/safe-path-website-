"use client";

import React, { useState } from "react";
import { X, Activity, Server, CloudLightning, ShieldAlert } from "lucide-react";

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PredictionResult {
  risk_level: string;
  flood_probability: number;
  confidence: number;
  recommendation: string;
}

export default function PredictionModal({ isOpen, onClose }: PredictionModalProps) {
  const [temp, setTemp] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [satHash, setSatHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  if (!isOpen) return null;

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          temperature: parseFloat(temp), 
          rainfall_mm: parseFloat(rainfall),
          satellite_hash: satHash || "null"
        }),
      });
      const data = await response.json();
      setResult(data as PredictionResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0a0e1a] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">AI Risk Predictor</h2>
              <p className="text-xs text-slate-400">Synthesize telemetry into probabilistic risk models</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Form */}
          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">LOCAL TEMPERATURE (°C)</label>
                <div className="relative">
                  <CloudLightning className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="number" step="0.1" required value={temp} onChange={(e) => setTemp(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-4 py-2 text-slate-200 outline-none text-sm"
                    placeholder="24.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">RAINFALL RATE (mm/hr)</label>
                <div className="relative">
                  <CloudLightning className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="number" step="0.1" required value={rainfall} onChange={(e) => setRainfall(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-4 py-2 text-slate-200 outline-none text-sm"
                    placeholder="110.0"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">SATELLITE IMAGE HASH (Optional)</label>
              <div className="relative">
                <Server className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" value={satHash} onChange={(e) => setSatHash(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-4 py-2 text-slate-200 outline-none text-sm font-mono"
                  placeholder="e.g. 0x9f3b2a"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <><Activity className="w-4 h-4" /> Run Deep Learning Model</>
              )}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div className="bg-slate-900/80 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className={`w-8 h-8 ${result.risk_level === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-100 mb-1">Risk Level: {result.risk_level}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-300 mb-2">
                    <span>Flood Probability: <strong className="text-white">{(result.flood_probability * 100).toFixed(1)}%</strong></span>
                    <span>Confidence: <strong className="text-white">{(result.confidence * 100).toFixed(1)}%</strong></span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono p-2 bg-black/40 rounded-lg border border-slate-800">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
