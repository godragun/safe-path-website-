"use client";

import { FormEvent, useState } from "react";
import { Activity, CloudRain, ShieldAlert } from "lucide-react";

type Prediction = {
  risk_level: string;
  flood_probability: number;
  confidence: number;
  recommendation: string;
};

type PredictionEngineProps = {
  apiBaseUrl?: string;
};

export default function PredictionEngine({ apiBaseUrl = "http://localhost:8000" }: PredictionEngineProps) {
  const [temperature, setTemperature] = useState("24.5");
  const [rainfall, setRainfall] = useState("110");
  const [satelliteHash, setSatelliteHash] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temperature: Number(temperature), rainfall_mm: Number(rainfall), satellite_hash: satelliteHash || "unavailable" }),
      });
      if (!response.ok) throw new Error("Prediction request failed");
      setPrediction(await response.json() as Prediction);
    } catch {
      setPrediction({ risk_level: "OFFLINE", flood_probability: 0, confidence: 0, recommendation: "Prediction service unavailable. Continue with local procedures and live gauge readings." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-slate-700 bg-[#111923] p-3">
      <div className="mb-3 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Prediction engine</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Telemetry synthesis</h2></div><Activity className="h-4 w-4 text-[#69b7c4]" /></div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="block text-[10px] uppercase tracking-wide text-slate-500">Temperature C<input required type="number" step="0.1" value={temperature} onChange={(event) => setTemperature(event.target.value)} className="mt-1 w-full border border-slate-700 bg-[#0b1017] px-2.5 py-2 text-xs text-slate-200" /></label>
        <label className="block text-[10px] uppercase tracking-wide text-slate-500">Rainfall mm/hr<input required type="number" step="0.1" value={rainfall} onChange={(event) => setRainfall(event.target.value)} className="mt-1 w-full border border-slate-700 bg-[#0b1017] px-2.5 py-2 text-xs text-slate-200" /></label>
        <label className="block text-[10px] uppercase tracking-wide text-slate-500">Satellite hash<input value={satelliteHash} onChange={(event) => setSatelliteHash(event.target.value)} placeholder="Optional" className="mt-1 w-full border border-slate-700 bg-[#0b1017] px-2.5 py-2 font-mono text-xs text-slate-200 placeholder:text-slate-600" /></label>
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#69b7c4] px-3 py-2 text-xs font-bold text-[#0b1017] disabled:cursor-wait disabled:opacity-60"><CloudRain className="h-3.5 w-3.5" /> {loading ? "Synthesizing..." : "Run prediction"}</button>
      </form>
      {prediction && <div className="mt-3 border-t border-slate-700 pt-3"><div className="flex items-start gap-2"><ShieldAlert className={`mt-0.5 h-4 w-4 ${prediction.risk_level === "CRITICAL" ? "text-red-400" : "text-amber-400"}`} /><div className="min-w-0"><p className="text-xs font-bold text-slate-200">{prediction.risk_level} risk <span className="font-normal text-slate-500">/ {(prediction.flood_probability * 100).toFixed(0)}%</span></p><p className="mt-1 text-[11px] leading-4 text-slate-400">{prediction.recommendation}</p><p className="mt-2 font-mono text-[10px] text-slate-600">Confidence {(prediction.confidence * 100).toFixed(0)}%</p></div></div></div>}
    </section>
  );
}
