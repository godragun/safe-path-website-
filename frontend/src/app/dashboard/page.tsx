"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Map as MapIcon, Shield, CloudRain, Zap, ShieldCheck, AlertTriangle, Wifi, WifiOff, Clock, Smartphone, Satellite } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import Chatbot from "@/components/Chatbot";
import PredictionEngine from "@/components/PredictionEngine";
import XAIAuditDrawer, { AuditData } from "@/components/XAIAuditDrawer";
import { HazardPin } from "@/components/OfflineMap";
import ReportEmergencyModal from "@/components/ReportEmergencyModal";
import ThemeToggle from "@/components/ThemeToggle";
import { Plus } from "lucide-react";

import CommunityPulse from "@/components/CommunityPulse";
import PreDisasterAutopilot from "@/components/PreDisasterAutopilot";
import ResilienceRouting, { RouteOption } from "@/components/ResilienceRouting";

const MapView = dynamic(() => import("@/components/OfflineMap"), { ssr: false });

const initialRoutes: RouteOption[] = [
  { id: "r1", type: "PRIMARY", distanceKm: 4.8, timeMinutes: 12, safetyScore: 91, status: "AVAILABLE", description: "Main highway via Route 4" },
  { id: "r2", type: "ALTERNATIVE", distanceKm: 5.7, timeMinutes: 15, safetyScore: 84, status: "AVAILABLE", description: "Secondary roads via East bypass" },
  { id: "r3", type: "LAST_RESORT", distanceKm: 7.2, timeMinutes: 20, safetyScore: 72, status: "CONTINGENCY", description: "Elevated path via old bridge (use only if required)" }
];

export default function Dashboard() {
  const [showMap, setShowMap] = useState(true);
  const [hazards, setHazards] = useState<HazardPin[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>(initialRoutes);
  const [activeRouteId, setActiveRouteId] = useState("r1");
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditData | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  
  const [connectivity, setConnectivity] = useState({ internet: true, mobile: true, iot: true, satellite: false });

  // Update online status automatically
  useEffect(() => {
    const handleOnline = () => setConnectivity(p => ({ ...p, internet: true, mobile: true }));
    const handleOffline = () => setConnectivity(p => ({ ...p, internet: false, mobile: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // initial check
    setConnectivity(p => ({ ...p, internet: navigator.onLine, mobile: navigator.onLine }));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePinClick = useCallback((pin: HazardPin) => {
    setAuditDrawerOpen(true);
  }, []);

  const simulateDisaster = () => {
    setIsDemoActive(true);
    // Step 1: AI risk increases
    setPredictionData({
      risk_level: "CRITICAL",
      flood_probability: 0.92,
      autopilot: {
        summary: "Simulated flood detected. Evacuation protocols active.",
        tasks: [
          { condition: "NOW", task: "Grab emergency bag" },
          { condition: "IF RISK REACHES 70", task: "Move vehicle to high ground" },
          { condition: "CRITICAL", task: "Follow Primary Route to Viharamahadevi Park Shelter" }
        ]
      }
    });
    
    // Step 2: Route failure
    setTimeout(() => {
      setRoutes(prev => prev.map(r => {
        if (r.id === "r1") return { ...r, status: "BLOCKED", safetyScore: 12 };
        if (r.id === "r2") return { ...r, status: "AVAILABLE", safetyScore: 89 };
        return r;
      }));
      setActiveRouteId("r2");
    }, 3000);
    
    // Step 3: Emergency Mode activation
    setTimeout(() => {
      setIsEmergencyMode(true);
    }, 5000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isEmergencyMode ? 'bg-[#110505] text-red-50' : 'bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100'} flex flex-col`}>
      <header className={`relative z-20 flex min-h-16 items-center justify-between border-b px-4 py-3 sm:px-6 ${isEmergencyMode ? 'bg-red-950 border-red-900' : 'bg-white dark:bg-[#0b1017] border-slate-200 dark:border-slate-800'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef6a5b]/10 dark:bg-[#ef6a5b]/15 text-[#ef6a5b]"><Shield className="h-5 w-5" /></div>
          <div><h1 className="text-base font-bold tracking-tight sm:text-lg">SafePath {isEmergencyMode ? <span className="text-red-400">/ EMERGENCY MODE</span> : <span className="font-normal text-slate-500">/ Command Center</span>}</h1></div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={simulateDisaster} className="hidden md:flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 hover:bg-amber-500/30">
            Simulate Disaster
          </button>
          {!isEmergencyMode && (
            <>
              <Link href="/survival" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                <BookOpen className="h-4 w-4" /> Survival Kit & Guides
              </Link>
              <Link href="/communication" className="hidden md:flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Wifi className="h-4 w-4" /> Comms Hub
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative">
        <aside className={`${isEmergencyMode ? 'bg-[#1a0808] border-red-900/50' : 'bg-white dark:bg-[#0b1017] border-slate-200 dark:border-slate-800'} z-20 flex flex-col gap-3 overflow-y-auto border-r p-4 w-full lg:w-[28rem] flex-shrink-0`}>
          
          {/* Signature Dashboard Widget */}
          <div className={`p-4 rounded-xl border ${isEmergencyMode ? 'bg-red-950/50 border-red-900' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">SafePath Resilience Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500">Risk Level</div>
                <div className={`text-xl font-black ${predictionData?.risk_level === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>
                  {predictionData ? predictionData.risk_level : "ELEVATED"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500">Resilience Score</div>
                <div className="text-xl font-black text-emerald-500">84/100</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
              <div className="text-[10px] uppercase text-slate-500 mb-2">Connectivity</div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={`flex items-center gap-1 ${connectivity.internet ? 'text-emerald-500' : 'text-red-500'}`}><Wifi className="w-3 h-3"/> Web</span>
                <span className={`flex items-center gap-1 ${connectivity.mobile ? 'text-emerald-500' : 'text-red-500'}`}><Smartphone className="w-3 h-3"/> Cell</span>
                <span className="flex items-center gap-1 text-emerald-500"><Zap className="w-3 h-3"/> IoT</span>
                <span className="flex items-center gap-1 text-slate-500"><Satellite className="w-3 h-3"/> Sat (N/A)</span>
              </div>
              {!connectivity.internet && (
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] rounded flex items-start gap-2">
                  <WifiOff className="w-4 h-4 shrink-0" />
                  Internet disconnected. Power & Connectivity Conservation Mode active. Reports will be queued locally.
                </div>
              )}
            </div>
          </div>

          <ResilienceRouting routes={routes} onSelectRoute={(r) => setActiveRouteId(r.id)} activeRouteId={activeRouteId} />
          
          {!isEmergencyMode && (
             <PredictionEngine apiBaseUrl="http://localhost:8000" />
          )}
          
          <PreDisasterAutopilot riskData={predictionData} />
          
          {!isEmergencyMode && (
            <CommunityPulse />
          )}

        </aside>

        <section className="relative flex-1 bg-slate-100 dark:bg-[#111923] flex flex-col transition-colors duration-300">
          
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg shadow-md p-1 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setShowMap(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${showMap ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              Map View
            </button>
            <button 
              onClick={() => setShowMap(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${!showMap ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              List View
            </button>
          </div>

          {showMap ? (
            <div className="absolute inset-0 z-10">
              <MapView 
                hazards={hazards} 
                routes={routes} 
                safeZones={[{ id: "sz1", lat: 6.927, lng: 79.865, name: "Viharamahadevi Park Shelter" }, { id: "sz2", lat: 6.905, lng: 79.851, name: "Bambalapitiya Safe Zone" }]} 
                onPinClick={handlePinClick} 
              />
              
              <div className="glass-panel absolute left-4 top-4 z-10 p-3 rounded-lg w-64 shadow-xl pointer-events-none">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Disaster Timeline</p>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  <div className="relative flex items-start gap-3">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-[#111923] z-10 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Prediction Detected</div>
                      <div className="text-[9px] text-slate-500">14:00 PM</div>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-4 border-white dark:border-[#111923] z-10 shrink-0 mt-0.5 ${isDemoActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <div>
                      <div className={`text-[10px] font-bold ${isDemoActive ? 'text-amber-500' : 'text-slate-400'}`}>Risk Increasing</div>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-4 border-white dark:border-[#111923] z-10 shrink-0 mt-0.5 ${predictionData?.risk_level === 'CRITICAL' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <div>
                      <div className={`text-[10px] font-bold ${predictionData?.risk_level === 'CRITICAL' ? 'text-red-500' : 'text-slate-400'}`}>Route Changed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 z-10 p-6 overflow-y-auto pt-20">
              <h2 className="text-2xl font-bold mb-6">Emergency Reports & Hazards</h2>
              {hazards.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-500">
                  No active hazards reported in your area.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hazards.map((h, idx) => {
                    const fallbackImg = `/images/disaster-${(idx % 3) + 1}.jpg`;
                    return (
                      <div key={h.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row">
                        <div className="w-full sm:w-1/3 h-32 sm:h-auto shrink-0 relative">
                          <img src={h.imageUrl || fallbackImg} alt="Hazard" className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${h.severity === 'critical' ? 'bg-red-500' : h.severity === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                            <span className="font-bold capitalize">{h.severity} Hazard</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{h.description}</p>
                          <div className="text-xs text-slate-500 mt-3 font-mono">Lat: {h.lat.toFixed(4)}, Lng: {h.lng.toFixed(4)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => setReportModalOpen(true)}
            className="absolute bottom-6 right-6 z-40 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold px-6 py-4 transition-all hover:scale-105 active:scale-[0.98] shadow-lg shadow-red-500/25"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Report Emergency</span>
          </button>
        </section>
      </main>

      <ReportEmergencyModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        onSubmit={(newReport) => setHazards(prev => [...prev, newReport])} 
      />

      <XAIAuditDrawer isOpen={auditDrawerOpen} onClose={() => setAuditDrawerOpen(false)} auditData={selectedAudit} />
      
      {!isEmergencyMode && <Chatbot />}
    </div>
  );
}
