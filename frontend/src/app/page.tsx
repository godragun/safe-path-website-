"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Shield, Play, Square, Radio, Zap, Bell
} from "lucide-react";
import dynamic from "next/dynamic";

import StatsPanel from "@/components/StatsPanel";
import LiveFeed, { FeedItem } from "@/components/LiveFeed";
import XAIAuditDrawer, { AuditData } from "@/components/XAIAuditDrawer";
import { HazardPin } from "@/components/OfflineMap";

// Dynamic import MapView to avoid SSR issues with maplibre-gl
const MapView = dynamic(() => import("@/components/OfflineMap"), { ssr: false });

// ─── Mock Audit Data Generator ───────────────────────────────
function generateAuditData(pin: HazardPin): AuditData {
  const isCritical = pin.severity === "critical";
  const isWarning = pin.severity === "warning";
  return {
    id: pin.id,
    verdict: isCritical ? "Confirmed" : isWarning ? "Needs Verification" : "Rejected",
    confidence_score: isCritical ? 0.92 + Math.random() * 0.07 : isWarning ? 0.55 + Math.random() * 0.2 : 0.1 + Math.random() * 0.2,
    description: pin.description,
    checks: {
      image_ai: {
        status: isCritical ? "Pass" : "Fail",
        metric: `pHash uniqueness: ${(0.85 + Math.random() * 0.14).toFixed(3)} | ViT conf: ${(0.7 + Math.random() * 0.29).toFixed(2)}`,
        desc: isCritical
          ? "ViT depth estimation confirms 0.4m standing water. pHash confirms unique image."
          : "Image does not match flood/hazard classification. Possible false submission.",
      },
      weather: {
        status: isCritical || isWarning ? "Pass" : "Fail",
        metric: `Rainfall: ${(35 + Math.random() * 80).toFixed(0)}mm/hr | Gauge delta: +${(0.5 + Math.random() * 2).toFixed(1)}m`,
        desc: "Rainfall intensity and gauge readings are consistent with flash flood conditions in this ward.",
      },
      cluster: {
        status: isCritical ? "Pass" : "Fail",
        metric: `DBSCAN ε=200m | Cluster size: ${Math.floor(3 + Math.random() * 8)} | H3 res-9`,
        desc: isCritical
          ? "Report falls within an active spatial cluster of corroborating reports."
          : "No nearby corroborating reports found within 200m radius.",
      },
      location: {
        status: isCritical || isWarning ? "Pass" : "Fail",
        metric: `GPS accuracy: ±${(3 + Math.random() * 12).toFixed(0)}m | Feature match: ${(0.6 + Math.random() * 0.39).toFixed(2)}`,
        desc: "Photo background features are consistent with street-view imagery at claimed coordinates.",
      },
      risk: {
        status: isCritical ? "High" : isWarning ? "Medium" : "Low",
        metric: `Infrastructure score: ${(0.5 + Math.random() * 0.49).toFixed(2)} | Pop. density: ${Math.floor(800 + Math.random() * 4000)}/km²`,
        desc: isCritical
          ? "Location is near critical infrastructure (hospital, school). High evacuation priority."
          : "Low infrastructure criticality in this area.",
      },
    },
  };
}

// ─── Main Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [hazards, setHazards] = useState<HazardPin[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditData | null>(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    confirmedHazards: 0,
    maxGaugeLevel: 1.5,
    activeWarnings: 0,
    timeElapsed: 0,
    clustersFound: 0,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  const handlePinClick = useCallback((pin: HazardPin) => {
    setSelectedAudit(generateAuditData(pin));
    setAuditDrawerOpen(true);
  }, []);

  const startSimulation = useCallback(() => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setIsSimulating(true);
    setHazards([]);
    setFeedItems([]);
    setStats({ totalReports: 0, confirmedHazards: 0, maxGaugeLevel: 1.5, activeWarnings: 0, timeElapsed: 0, clustersFound: 0 });

    const es = new EventSource("http://localhost:8000/api/simulate-storm");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Add new hazard pins from reports
        const newPins: HazardPin[] = (data.new_reports || []).map((r: any) => ({
          id: r.id,
          lat: r.location.lat,
          lng: r.location.lng,
          severity: data.time_elapsed_min > 60 ? "critical" : data.time_elapsed_min > 30 ? "warning" : "info",
          description: r.description,
        }));

        setHazards((prev) => [...prev, ...newPins]);

        // Build feed items
        const reportFeeds: FeedItem[] = (data.new_reports || []).map((r: any) => ({
          id: r.id,
          description: r.description,
          ward_id: r.ward_id,
          timestamp: r.timestamp,
          type: "report" as const,
        }));

        const gaugeFeeds: FeedItem[] = (data.gauges || []).map((g: any) => ({
          id: g.gauge_id + "-" + data.time_elapsed_min,
          description: `Gauge ${g.gauge_id}: ${g.water_level_m}m (${g.flow_rate_m3s} m³/s)`,
          ward_id: "SYS",
          timestamp: g.timestamp,
          type: "gauge" as const,
        }));

        const warningFeeds: FeedItem[] = (data.active_warnings || []).map((w: string, i: number) => ({
          id: `warn-${data.time_elapsed_min}-${i}`,
          description: w,
          ward_id: "ALERT",
          timestamp: new Date().toISOString(),
          type: "warning" as const,
        }));

        setFeedItems((prev) => [...warningFeeds, ...reportFeeds, ...gaugeFeeds, ...prev].slice(0, 200));

        // Update stats
        const maxGauge = Math.max(...(data.gauges || []).map((g: any) => g.water_level_m), 0);
        setStats((prev) => ({
          totalReports: prev.totalReports + (data.new_reports || []).length,
          confirmedHazards: prev.confirmedHazards + newPins.filter((p) => p.severity === "critical").length,
          maxGaugeLevel: Math.max(prev.maxGaugeLevel, maxGauge),
          activeWarnings: (data.active_warnings || []).length,
          timeElapsed: data.time_elapsed_min,
          clustersFound: Math.floor((prev.totalReports + (data.new_reports || []).length) / 5),
        }));
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    es.onerror = () => {
      es.close();
      setIsSimulating(false);
    };
  }, []);

  const stopSimulation = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0e1a]">
      {/* ─── Top Navigation Bar ─────────────────────────────── */}
      <header className="shrink-0 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between bg-[#0a0e1a]/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">SafePath</span>
              <span className="text-slate-500 font-normal ml-2 text-sm">Command Center</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live Simulation</span>
            </motion.div>
          )}

          {/* Control buttons */}
          <button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isSimulating
                ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/25"
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-4 h-4" /> Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Simulation
              </>
            )}
          </button>

          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-slate-400" />
            {stats.activeWarnings > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {stats.activeWarnings}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Stats + Feed */}
        <aside className="w-[380px] shrink-0 border-r border-slate-800/60 flex flex-col overflow-hidden bg-[#0b1120]">
          {/* Stats */}
          <div className="p-4 border-b border-slate-800/60 shrink-0">
            <StatsPanel {...stats} />
          </div>

          {/* Feed */}
          <div className="flex-1 p-3 overflow-hidden">
            <LiveFeed items={feedItems} />
          </div>
        </aside>

        {/* Right Panel: Map */}
        <main className="flex-1 relative">
          <MapView hazards={hazards} onPinClick={handlePinClick} />

          {/* Floating legend */}
          <div className="absolute top-4 left-4 glass-panel rounded-xl p-3 z-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Hazard Severity</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[11px] text-slate-400">Critical — Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-[11px] text-slate-400">Warning — Needs Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                <span className="text-[11px] text-slate-400">Info — Unverified</span>
              </div>
            </div>
          </div>

          {/* Floating instructions when idle */}
          {!isSimulating && hazards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-2xl p-8 text-center max-w-md pointer-events-auto"
              >
                <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ready to Deploy</h2>
                <p className="text-sm text-slate-400 mb-5">
                  Click <strong className="text-indigo-400">Start Simulation</strong> to replay a localized flash-flood scenario. 
                  Watch as citizen reports and river gauge data stream in real-time.
                </p>
                <button
                  onClick={startSimulation}
                  className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg font-semibold text-sm hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2 mx-auto"
                >
                  <Play className="w-4 h-4" /> Launch Storm Replay
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>

      {/* XAI Audit Drawer */}
      <XAIAuditDrawer
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        auditData={selectedAudit}
      />
    </div>
  );
}
