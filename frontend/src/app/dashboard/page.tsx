"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Shield, Zap, Wifi, WifiOff, Smartphone, Satellite, Plus, Activity, DownloadCloud, AlertOctagon, CloudLightning, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import Chatbot from "@/components/Chatbot";
import PredictionEngine from "@/components/PredictionEngine";
import XAIAuditDrawer, { AuditData } from "@/components/XAIAuditDrawer";
import { HazardPin } from "@/components/OfflineMap";
import ReportEmergencyModal from "@/components/ReportEmergencyModal";
import ThemeToggle from "@/components/ThemeToggle";
import ResilienceRouting, { RouteOption } from "@/components/ResilienceRouting";
import OfflineChecklist from "@/components/OfflineChecklist";
import { getPendingSOS, getPendingReports, syncAllPending, saveOfflineSOS } from "@/lib/offlineStore";

const MapView = dynamic(() => import("@/components/OfflineMap"), { ssr: false });

const initialRoutes: RouteOption[] = [
  { 
    id: "r1", 
    type: "FASTEST_ROUTE", 
    distanceKm: 4.8, 
    timeMinutes: 12, 
    safetyScore: 91, 
    status: "AVAILABLE", 
    description: "Main highway via Route 4",
    reasoning: ["Direct path", "Avoids local traffic"]
  },
  { 
    id: "r2", 
    type: "SAFEST_ROUTE", 
    distanceKm: 5.7, 
    timeMinutes: 15, 
    safetyScore: 98, 
    status: "AVAILABLE", 
    description: "Secondary roads via East bypass",
    reasoning: ["Avoids flood zone", "Avoids blocked road", "Near hospital", "Community reports indicate lower risk"]
  },
  { 
    id: "r3", 
    type: "LAST_RESORT", 
    distanceKm: 7.2, 
    timeMinutes: 20, 
    safetyScore: 72, 
    status: "CONTINGENCY", 
    description: "Elevated path via old bridge (use only if required)",
    reasoning: ["Elevated ground during floods"]
  }
];

export default function Dashboard() {
  const [showMap, setShowMap] = useState(true);
  const [hazards, setHazards] = useState<HazardPin[]>([
    { id: "h1", lat: 6.927, lng: 79.861, severity: "warning", description: "Road flooded", confidence: "HIGH", reportCount: 3 },
    { id: "h2", lat: 6.920, lng: 79.855, severity: "critical", description: "Tree fallen", confidence: "LOW", reportCount: 1 }
  ]);
  const [routes, setRoutes] = useState<RouteOption[]>(initialRoutes);
  const [activeRouteId, setActiveRouteId] = useState("r2");
  
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  
  const [connectivity, setConnectivity] = useState({ internet: true, mobile: true });
  const [isPrepared, setIsPrepared] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [pendingSOS, setPendingSOS] = useState<any[]>([]);
  const [pendingHazards, setPendingHazards] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const opState = connectivity.internet ? (isSyncing ? "RECOVER" : "PREPARE") : "SURVIVE";

  // Check queues
  const refreshQueues = async () => {
    const s = await getPendingSOS();
    const h = await getPendingReports();
    setPendingSOS(s);
    setPendingHazards(h);
  };

  useEffect(() => {
    refreshQueues();
  }, [reportModalOpen]);

  // Online / Offline handlers
  useEffect(() => {
    const handleOnline = () => {
      setConnectivity({ internet: true, mobile: true });
      triggerSync();
    };
    const handleOffline = () => setConnectivity({ internet: false, mobile: false });
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setConnectivity({ internet: navigator.onLine, mobile: navigator.onLine });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSync = async () => {
    setIsSyncing(true);
    setSyncMessage("Synchronizing emergency events...");
    
    // Fake delay for demo
    await new Promise(r => setTimeout(r, 2000));
    const result = await syncAllPending();
    
    setSyncMessage(`1 emergency event synchronized.`); // Demo override as requested "1 emergency event synchronized"
    refreshQueues();
    
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage("");
    }, 4000);
  };

  const handlePrepare = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsPrepared(true);
    }, 2500);
  };

  const handleSOS = async () => {
    let lat = null, lng = null;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        await queueSOS(lat, lng);
      }, async () => {
        await queueSOS(null, null);
      });
    } else {
      await queueSOS(null, null);
    }
  };

  const queueSOS = async (lat: number | null, lng: number | null) => {
    if (!connectivity.internet) {
      await saveOfflineSOS({
        id: `sos-${Date.now()}`,
        lat,
        lng,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      alert("SOS STORED LOCALLY\nYour emergency event has been saved on this device.\nIt will be synchronized automatically when connectivity returns.");
      refreshQueues();
    } else {
      alert("EMERGENCY ALERT\nI may be in danger.\nLast known location:\n" + (lat ? `${lat}, ${lng}` : "Unknown") + "\nTime:\n" + new Date().toLocaleTimeString() + "\nPlease contact emergency services or my emergency contacts.");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${
      opState === "SURVIVE" ? 'bg-[#110505] text-red-50' : 
      opState === "RECOVER" ? 'bg-[#050c11] text-blue-50' : 
      'bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100'
    }`}>
      
      {/* HEADER */}
      <header className={`relative z-20 flex min-h-16 items-center justify-between border-b px-4 py-3 sm:px-6 transition-colors ${
        opState === "SURVIVE" ? 'bg-red-950 border-red-900' : 
        opState === "RECOVER" ? 'bg-blue-950 border-blue-900' :
        'bg-white dark:bg-[#0b1017] border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            opState === "SURVIVE" ? 'bg-red-500/20 text-red-400' : 'bg-[#ef6a5b]/10 text-[#ef6a5b]'
          }`}>
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg">SafePath {
              opState === "SURVIVE" ? <span className="text-red-400">/ OFFLINE EMERGENCY MODE</span> : 
              opState === "RECOVER" ? <span className="text-blue-400">/ RECOVERING</span> : 
              <span className="font-normal text-slate-500">/ Command Center</span>
            }</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/survival" className="hidden md:flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-500/20">
            <BookOpen className="h-4 w-4" /> Survival Kit
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* SYNC BANNER */}
      {syncMessage && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-md">
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isSyncing ? "CONNECTION RESTORED. Synchronizing..." : syncMessage}
        </div>
      )}

      <main className="flex-1 flex flex-col lg:flex-row relative">
        <aside className={`z-20 flex flex-col gap-3 overflow-y-auto border-r p-4 w-full lg:w-[28rem] flex-shrink-0 transition-colors ${
          opState === "SURVIVE" ? 'bg-[#1a0808] border-red-900/50' : 'bg-white dark:bg-[#0b1017] border-slate-200 dark:border-slate-800'
        }`}>
          
          {/* OFFLINE CHECKLIST / ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mb-2">
             <button 
                onClick={handlePrepare}
                disabled={isPrepared || opState === "SURVIVE"}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  isPrepared 
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60" 
                    : opState === "SURVIVE"
                    ? "bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed"
                    : "bg-indigo-500 text-white border-indigo-600 hover:bg-indigo-600 shadow-lg"
                }`}
             >
               <DownloadCloud className="w-6 h-6 mb-2" />
               <span className="text-xs font-bold text-center leading-tight">PREPARE MY AREA</span>
             </button>
             
             <button 
                onClick={handleSOS}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 bg-red-600 text-white border-red-700 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/30"
             >
               <AlertOctagon className="w-6 h-6 mb-2" />
               <span className="text-xs font-bold text-center leading-tight">🚨 I'M IN DANGER</span>
             </button>
          </div>

          <OfflineChecklist isPrepared={isPrepared} isDownloading={isDownloading} />

          {/* STATUS WIDGET */}
          <div className={`p-4 rounded-xl border ${opState === "SURVIVE" ? 'bg-red-950/50 border-red-900' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
              {opState === "SURVIVE" ? "LAST KNOWN SAFETY STATE" : "SafePath Resilience Status"}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[10px] uppercase text-slate-500 mb-1">Network Status</div>
                <div className={`text-sm font-black flex items-center gap-1 ${connectivity.internet ? 'text-emerald-500' : 'text-red-500'}`}>
                  {connectivity.internet ? <><Wifi className="w-4 h-4"/> ONLINE</> : <><WifiOff className="w-4 h-4"/> OFFLINE</>}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 mb-1">Last Synchronized</div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Activity className="w-4 h-4" /> {connectivity.internet ? 'Live' : '2 hours ago'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 border-t border-slate-200 dark:border-slate-700/50 pt-4">
               <div className="text-center">
                 <div className="text-xl font-bold text-red-500">7</div>
                 <div className="text-[8px] uppercase text-slate-500">Known Hazards</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold text-emerald-500">4</div>
                 <div className="text-[8px] uppercase text-slate-500">Safe Shelters</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold text-amber-500">3</div>
                 <div className="text-[8px] uppercase text-slate-500">Blocked Roads</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold text-blue-500">12</div>
                 <div className="text-[8px] uppercase text-slate-500">Facilities</div>
               </div>
            </div>
            
            {opState === "SURVIVE" && (
              <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] rounded flex items-start gap-2">
                <WifiOff className="w-4 h-4 shrink-0" />
                Internet unavailable. Using your last synchronized emergency data.
              </div>
            )}
          </div>

          {/* EMERGENCY QUEUE */}
          {(pendingSOS.length > 0 || pendingHazards.length > 0) && (
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <CloudLightning className="w-3 h-3" /> EMERGENCY QUEUE
              </h3>
              <ul className="space-y-2">
                {pendingSOS.map(s => (
                  <li key={s.id} className="flex items-center gap-2 text-xs text-red-400">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>SOS EVENT — Waiting for connection</span>
                  </li>
                ))}
                {pendingHazards.map(h => (
                  <li key={h.id} className="flex items-center gap-2 text-xs text-amber-400">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Hazard Report — Waiting for connection</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResilienceRouting routes={routes} onSelectRoute={(r) => setActiveRouteId(r.id)} activeRouteId={activeRouteId} />
          
          {/* AI SAFETY BRIEFING */}
          <div className="glass-panel-heavy bg-indigo-900/10 border-indigo-500/20 rounded-xl p-4 mt-2">
             <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-400">AI SAFETY BRIEFING</h3>
             </div>
             <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
               ⚠ <strong className="text-amber-500">HIGH RISK</strong><br/>
               3 hazards have been reported near your selected area. The eastern road network contains 2 reported blocked roads. Shelter B has recent closure reports.<br/><br/>
               <span className="text-emerald-500">Recommended action:</span> Use the northern route and proceed toward Viharamahadevi Park Shelter.
             </p>
          </div>

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
                onPinClick={() => setAuditDrawerOpen(true)} 
              />
            </div>
          ) : (
            <div className="absolute inset-0 z-10 p-6 overflow-y-auto pt-20">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Emergency Reports & Hazards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hazards.map((h, idx) => (
                  <div key={h.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row">
                    <div className="w-full sm:w-1/3 h-32 sm:h-auto shrink-0 relative bg-slate-800">
                      <img src={`/images/disaster-\${(idx % 3) + 1}.jpg`} alt="Hazard" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${h.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
                        <span className="font-bold capitalize text-slate-900 dark:text-white">{h.severity} Hazard</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">{h.description}</p>
                      <div className="flex justify-between items-end mt-3">
                        <div className="text-[10px] text-slate-500">Lat: {h.lat.toFixed(4)}, Lng: {h.lng.toFixed(4)}</div>
                        <div className="text-[10px] font-bold">
                          <span className="uppercase text-slate-500">Confidence: </span>
                          <span className={h.confidence === 'HIGH' ? 'text-emerald-500' : 'text-amber-500'}>
                            {h.confidence} (Reported by {h.reportCount})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-3">
             <button 
               onClick={() => setReportModalOpen(true)}
               className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-4 transition-all shadow-lg hover:scale-105"
             >
               <Plus className="w-5 h-5" />
               <span>Report Hazard</span>
             </button>
          </div>
          
          {/* DEMO MODE PANEL */}
          <div className="absolute bottom-6 left-6 z-40 bg-black/80 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl">
             <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> DEMO CONTROL PANEL
             </div>
             <div className="flex gap-2">
               <button onClick={() => setConnectivity({internet: false, mobile: false})} className="px-2 py-1 bg-slate-800 text-white text-xs rounded border border-slate-600 hover:bg-slate-700">Simulate Net OFF</button>
               <button onClick={() => { setConnectivity({internet: true, mobile: true}); triggerSync(); }} className="px-2 py-1 bg-slate-800 text-white text-xs rounded border border-slate-600 hover:bg-slate-700">Simulate Net ON</button>
             </div>
          </div>
        </section>
      </main>

      <ReportEmergencyModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        onSubmit={(newReport) => setHazards(prev => [...prev, { ...newReport, confidence: "LOW", reportCount: 1 }])} 
      />
      <XAIAuditDrawer isOpen={auditDrawerOpen} onClose={() => setAuditDrawerOpen(false)} auditData={null} />
    </div>
  );
}
