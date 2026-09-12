"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BookOpen, Play, Radio, Shield, Square, Zap } from "lucide-react";
import dynamic from "next/dynamic";

import Chatbot from "@/components/Chatbot";
import LiveFeed, { FeedItem } from "@/components/LiveFeed";
import PredictionEngine from "@/components/PredictionEngine";
import StatsPanel from "@/components/StatsPanel";
import XAIAuditDrawer, { AuditData } from "@/components/XAIAuditDrawer";
import { HazardPin } from "@/components/OfflineMap";

const MapView = dynamic(() => import("@/components/OfflineMap"), { ssr: false });

type StormReport = { id: string; location: { lat: number; lng: number }; description: string; ward_id: string; timestamp: string };
type GaugeReading = { gauge_id: string; water_level_m: number; flow_rate_m3s: number; timestamp: string };

const initialStats = {
  totalReports: 0,
  confirmedHazards: 0,
  maxGaugeLevel: 1.5,
  activeWarnings: 0,
  timeElapsed: 0,
  clustersFound: 0,
};

function generateAuditData(pin: HazardPin): AuditData {
  const isCritical = pin.severity === "critical";
  const isWarning = pin.severity === "warning";
  return {
    id: pin.id,
    verdict: isCritical ? "Confirmed" : isWarning ? "Needs Verification" : "Rejected",
    confidence_score: isCritical ? 0.92 + Math.random() * 0.07 : isWarning ? 0.55 + Math.random() * 0.2 : 0.1 + Math.random() * 0.2,
    description: pin.description,
    checks: {
      image_ai: { status: isCritical ? "Pass" : "Fail", metric: "Vision confidence: 0.91", desc: "Image classification is consistent with the reported hazard." },
      weather: { status: isCritical || isWarning ? "Pass" : "Fail", metric: "Rainfall and gauge delta aligned", desc: "Telemetry supports the reported flood conditions." },
      cluster: { status: isCritical ? "Pass" : "Fail", metric: "DBSCAN radius: 200m", desc: "Nearby reports either corroborate or fail to corroborate this event." },
      location: { status: isCritical || isWarning ? "Pass" : "Fail", metric: "GPS accuracy: +/- 8m", desc: "The location is plausible for the submitted report." },
      risk: { status: isCritical ? "High" : isWarning ? "Medium" : "Low", metric: "Infrastructure exposure assessed", desc: "Risk is weighted by infrastructure and population exposure." },
    },
  };
}

export default function Dashboard() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [hazards, setHazards] = useState<HazardPin[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditData | null>(null);
  const [stats, setStats] = useState(initialStats);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handlePinClick = useCallback((pin: HazardPin) => {
    setSelectedAudit(generateAuditData(pin));
    setAuditDrawerOpen(true);
  }, []);

  const stopSimulation = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsSimulating(false);
  }, []);

  const startSimulation = useCallback(() => {
    stopSimulation();
    setIsSimulating(true);
    setHazards([]);
    setFeedItems([]);
    setStats(initialStats);

    const eventSource = new EventSource("http://localhost:8000/api/simulate-storm");
    eventSourceRef.current = eventSource;
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const reportsData = data.new_reports as StormReport[] | undefined;
        const gaugesData = data.gauges as GaugeReading[] | undefined;
        const activeWarnings = data.active_warnings as string[] | undefined;
        const newPins: HazardPin[] = (reportsData ?? []).map((report) => ({
          id: report.id,
          lat: report.location.lat,
          lng: report.location.lng,
          severity: data.time_elapsed_min > 60 ? "critical" : data.time_elapsed_min > 30 ? "warning" : "info",
          description: report.description,
        }));
        const reports: FeedItem[] = (reportsData ?? []).map((report) => ({ id: report.id, description: report.description, ward_id: report.ward_id, timestamp: report.timestamp, type: "report" }));
        const gauges: FeedItem[] = (gaugesData ?? []).map((gauge) => ({ id: `${gauge.gauge_id}-${data.time_elapsed_min}`, description: `Gauge ${gauge.gauge_id}: ${gauge.water_level_m}m (${gauge.flow_rate_m3s} m3/s)`, ward_id: "SYS", timestamp: gauge.timestamp, type: "gauge" }));
        const warnings: FeedItem[] = (activeWarnings ?? []).map((warning, index) => ({ id: `warning-${data.time_elapsed_min}-${index}`, description: warning, ward_id: "ALERT", timestamp: new Date().toISOString(), type: "warning" }));
        const maxGauge = Math.max(...(gaugesData ?? []).map((gauge) => gauge.water_level_m), 0);

        setHazards((previous) => [...previous, ...newPins]);
        setFeedItems((previous) => [...warnings, ...reports, ...gauges, ...previous].slice(0, 200));
        setStats((previous) => ({
          totalReports: previous.totalReports + reports.length,
          confirmedHazards: previous.confirmedHazards + newPins.filter((pin) => pin.severity === "critical").length,
          maxGaugeLevel: Math.max(previous.maxGaugeLevel, maxGauge),
          activeWarnings: warnings.length,
          timeElapsed: data.time_elapsed_min,
          clustersFound: Math.floor((previous.totalReports + reports.length) / 5),
        }));
      } catch (error) {
        console.error("SSE parse error", error);
      }
    };
    eventSource.onerror = stopSimulation;
  }, [stopSimulation]);

  useEffect(() => stopSimulation, [stopSimulation]);

  return (
    <div className="min-h-screen bg-[#0b1017] text-slate-100">
      <header className="flex min-h-16 items-center justify-between border-b border-slate-800 bg-[#0b1017] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef6a5b]/15 text-[#ef6a5b]"><Shield className="h-5 w-5" /></div>
          <div><h1 className="text-base font-bold tracking-tight sm:text-lg">SafePath <span className="font-normal text-slate-500">/ Command Center</span></h1><p className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-600 sm:block">Urban flood response system</p></div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/offline-guide" className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white"><BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Offline guide</span></a>
          <div className="flex items-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs text-slate-400"><Radio className="h-3.5 w-3.5 text-[#52c7a3]" /> Live</div>
          <button aria-label="View alerts" className="relative rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><Bell className="h-5 w-5" />{stats.activeWarnings > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef6a5b] px-1 text-[9px] font-bold text-white">{stats.activeWarnings}</span>}</button>
        </div>
      </header>

      <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="flex max-h-[34rem] flex-col gap-3 overflow-y-auto border-b border-slate-800 bg-[#0f1721] p-3 lg:max-h-none lg:border-b-0 lg:border-r lg:p-4">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Operations overview</p><p className="mt-1 text-sm text-slate-300">Telemetry and citizen reports</p></div><button onClick={isSimulating ? stopSimulation : startSimulation} className="flex items-center gap-2 rounded-md bg-[#ef6a5b] px-3 py-2 text-xs font-bold text-white hover:bg-[#f27a6b]">{isSimulating ? <><Square className="h-3.5 w-3.5" /> Stop</> : <><Play className="h-3.5 w-3.5" /> Start</>}</button></div>
          <StatsPanel {...stats} />
          <PredictionEngine />
          <div className="min-h-64 flex-1"><LiveFeed items={feedItems} /></div>
        </aside>

        <section className="relative min-h-[32rem] overflow-hidden bg-[#111923]">
          <MapView hazards={hazards} onPinClick={handlePinClick} />
          <div className="absolute left-4 top-4 z-10 border border-slate-700 bg-[#111923]/95 p-3 shadow-lg"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Hazard severity</p><div className="space-y-2 text-[11px] text-slate-300"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Warning</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Unverified</span></div></div>
          {!isSimulating && hazards.length === 0 && <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6"><div className="pointer-events-auto max-w-md border border-slate-700 bg-[#111923] p-7 text-center shadow-xl"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#ef6a5b]/15 text-[#ef6a5b]"><Zap className="h-6 w-6" /></div><h2 className="text-xl font-bold">Ready for storm replay</h2><p className="mt-2 text-sm leading-6 text-slate-400">Stream synthetic reports and river telemetry onto the map for an incident-response drill.</p><button onClick={startSimulation} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#ef6a5b] px-4 py-3 text-sm font-bold text-white hover:bg-[#f27a6b]"><Play className="h-4 w-4" /> Launch replay</button></div></div>}
        </section>
      </main>

      <XAIAuditDrawer isOpen={auditDrawerOpen} onClose={() => setAuditDrawerOpen(false)} auditData={selectedAudit} />
      <Chatbot />
    </div>
  );
}
