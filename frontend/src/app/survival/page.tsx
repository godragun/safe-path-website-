"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert, Waves, Flame, Tornado } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const disasters = [
  {
    id: "earthquake",
    name: "Earthquake",
    description: "Sudden ground shaking. Learn drop, cover, and hold on techniques.",
    image: "/images/earthquake.jpg",
    risk: "High",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "amber-500"
  },
  {
    id: "flood",
    name: "Flood",
    description: "Rising water levels. Learn evacuation and water safety.",
    image: "/images/flood.jpg",
    risk: "Critical",
    icon: <Waves className="w-5 h-5" />,
    color: "cyan-500"
  },
  {
    id: "wildfire",
    name: "Wildfire",
    description: "Rapidly spreading fire. Learn smoke avoidance and evacuation.",
    image: "/images/wildfire.jpg",
    risk: "High",
    icon: <Flame className="w-5 h-5" />,
    color: "red-500"
  },
  {
    id: "cyclone",
    name: "Cyclone",
    description: "Extreme wind and rain. Learn indoor sheltering protocols.",
    image: "/images/cyclone.jpg",
    risk: "Moderate",
    icon: <Tornado className="w-5 h-5" />,
    color: "blue-500"
  },
  {
    id: "tsunami",
    name: "Tsunami",
    description: "Coastal massive waves. Evacuate to high ground immediately.",
    image: "/images/tsunami.jpg",
    risk: "Critical",
    icon: <Waves className="w-5 h-5" />,
    color: "red-500"
  },
  {
    id: "landslide",
    name: "Landslide",
    description: "Mud and rock shifts on slopes. Avoid steep areas during heavy rain.",
    image: "/images/landslide.jpg",
    risk: "High",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "amber-500"
  }
];

export default function SurvivalCenter() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0b1017] glass-panel-heavy sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">Emergency Survival Center</h1>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 animate-fade-in">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Know the Risk.<br/>Find the Safe Way.</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Select an emergency situation below to learn crucial survival steps. Do not wait until disaster strikes to prepare.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {disasters.map((disaster) => (
            <div key={disaster.id} className="group relative bg-white dark:bg-[#111923] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row h-full">
              {/* Image Section */}
              <div className="w-full sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                <img 
                  src={disaster.image} 
                  alt={disaster.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/80 mix-blend-multiply" />
                <div className={`absolute top-4 left-4 sm:left-auto sm:right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md text-white backdrop-blur-md border border-white/20
                  ${disaster.risk === 'Critical' ? 'bg-red-500/80' : 
                    disaster.risk === 'High' ? 'bg-amber-500/80' : 'bg-cyan-500/80'}`}>
                  {disaster.risk} Risk
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {disaster.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{disaster.name}</h3>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                  {disaster.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <Link 
                    href={`/survival-kit?context=${disaster.id}`}
                    className="inline-flex items-center justify-center w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Learn What To Do
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
