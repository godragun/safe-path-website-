"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, ShieldAlert, Activity } from "lucide-react";

interface Incident {
  id: string;
  hazard_type: string;
  report_count: number;
  first_reported: string;
  latest_report: string;
  affected_radius_km: number;
  confidence: string;
  trend: string;
}

export default function CommunityPulse() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/community-pulse");
        if (response.ok) {
          const data = await response.json();
          setIncidents(data.incidents || []);
        }
      } catch (err) {
        console.error("Failed to fetch community pulse", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPulse();
  }, []);

  return (
    <section className="glass-panel-heavy bg-white dark:bg-transparent rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Community Intelligence</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">Community Pulse</h2>
        </div>
        <Users className="h-4 w-4 text-purple-400" />
      </div>

      {loading ? (
        <div className="flex justify-center p-4"><Activity className="w-5 h-5 animate-pulse text-slate-400" /></div>
      ) : incidents.length === 0 ? (
        <div className="text-xs text-slate-500 py-4 text-center">No emerging incidents detected.</div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-slate-50 dark:bg-[#0b1017]/80 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{inc.hazard_type}</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded border border-purple-500/20">
                  {inc.report_count} Reports
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-2">
                <div>First: <span className="font-mono">{inc.first_reported}</span></div>
                <div>Latest: <span className="font-mono">{inc.latest_report}</span></div>
                <div>Radius: {inc.affected_radius_km}km</div>
                <div>Conf: {inc.confidence}</div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <TrendingUp className="w-3.5 h-3.5" /> Trend: {inc.trend}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
