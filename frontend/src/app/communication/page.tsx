"use client";

import { useState } from "react";
import { ArrowLeft, Wifi, Radio, Satellite, ShieldAlert, Smartphone } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function CommunicationHub() {
  const [activeTab, setActiveTab] = useState<"MESH" | "RADIO" | "SAT">("MESH");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="relative z-20 flex min-h-16 items-center justify-between border-b px-4 py-3 sm:px-6 bg-white dark:bg-[#0b1017] border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-lg">Communication Hub</h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Emergency Fallback Ladder</h2>
          <p className="text-slate-500 dark:text-slate-400">
            When standard cellular networks and internet fail, SafePath activates peer-to-peer and offline communication protocols to keep you connected with your community and first responders.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("MESH")}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "MESH" ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10" : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"}`}
          >
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${activeTab === "MESH" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Mesh Network</h3>
            <p className="text-xs text-slate-500">Peer-to-peer Bluetooth/Wi-Fi Direct</p>
          </button>
          
          <button 
            onClick={() => setActiveTab("RADIO")}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "RADIO" ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10" : "border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800"}`}
          >
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${activeTab === "RADIO" ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">HAM / FM Radio</h3>
            <p className="text-xs text-slate-500">Analog emergency broadcasts</p>
          </button>

          <button 
            onClick={() => setActiveTab("SAT")}
            className={`p-6 rounded-2xl border-2 text-left transition-all ${activeTab === "SAT" ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10" : "border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800"}`}
          >
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${activeTab === "SAT" ? "bg-purple-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-1">Satellite Link</h3>
            <p className="text-xs text-slate-500">Low-bandwidth text relay</p>
          </button>
        </div>

        <div className="glass-panel bg-white dark:bg-[#111923] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-xl">
          {activeTab === "MESH" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">SafePath Mesh Protocol</h3>
                  <p className="text-sm text-slate-500">Currently Scanning for Peers...</p>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-bold">Nearby Nodes</div>
                  <div className="text-xs font-mono bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded">3 ACTIVE</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0b1017] rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-mono">NODE-84F2</span>
                    </div>
                    <span className="text-xs text-slate-500">12m away (Bluetooth)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0b1017] rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-mono">NODE-A1B9</span>
                    </div>
                    <span className="text-xs text-slate-500">45m away (Wi-Fi Direct)</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Broadcast Emergency SOS via Mesh
              </button>
            </div>
          )}

          {activeTab === "RADIO" && (
            <div className="animate-fade-in space-y-6">
               <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <Radio className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Radio Frequencies</h3>
                  <p className="text-sm text-slate-500">Local emergency broadcast stations</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-3xl font-black text-emerald-500 mb-1">103.2 FM</div>
                  <div className="text-sm font-bold">National Disaster Radio</div>
                  <p className="text-xs text-slate-500 mt-2">Continuous weather and evacuation updates.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-3xl font-black text-emerald-500 mb-1">146.520 MHz</div>
                  <div className="text-sm font-bold">HAM Radio Calling Freq</div>
                  <p className="text-xs text-slate-500 mt-2">Use if you have an amateur radio license.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "SAT" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center">
                  <Satellite className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Satellite Relay</h3>
                  <p className="text-sm text-slate-500">Requires supported hardware (e.g. iPhone 14+)</p>
                </div>
              </div>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-center">
                <ShieldAlert className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-purple-500 mb-2">No Satellite Connection</h4>
                <p className="text-sm text-purple-400/80 mb-4">Please move outdoors with a clear view of the sky to establish a connection.</p>
                <button className="px-6 py-2 bg-purple-500 text-white font-bold rounded-lg opacity-50 cursor-not-allowed">
                  Send SOS via Satellite
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
