"use client";

import { MapPin, Navigation, ShieldAlert, ArrowRight } from "lucide-react";

export interface RouteOption {
  id: string;
  type: "PRIMARY" | "ALTERNATIVE" | "LAST_RESORT";
  distanceKm: number;
  timeMinutes: number;
  safetyScore: number;
  status: "AVAILABLE" | "BLOCKED" | "CONTINGENCY";
  description: string;
}

interface ResilienceRoutingProps {
  routes: RouteOption[];
  onSelectRoute: (route: RouteOption) => void;
  activeRouteId?: string;
}

export default function ResilienceRouting({ routes, onSelectRoute, activeRouteId }: ResilienceRoutingProps) {
  return (
    <section className="glass-panel-heavy bg-white dark:bg-transparent rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/50">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Navigation</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">Resilience Routing</h2>
        </div>
        <Navigation className="h-4 w-4 text-blue-400" />
      </div>

      <div className="space-y-3">
        {routes.map((route) => {
          const isPrimary = route.type === "PRIMARY";
          const isAlternative = route.type === "ALTERNATIVE";
          
          let statusColor = "bg-slate-500";
          let dotColor = "bg-slate-500";
          
          if (route.status === "AVAILABLE") {
            statusColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
            dotColor = "bg-emerald-500";
          } else if (route.status === "BLOCKED") {
            statusColor = "text-red-600 bg-red-500/10 border-red-500/20";
            dotColor = "bg-red-500";
          } else if (route.status === "CONTINGENCY") {
            statusColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";
            dotColor = "bg-amber-500";
          }

          const isActive = route.id === activeRouteId;

          return (
            <div 
              key={route.id}
              onClick={() => route.status !== "BLOCKED" && onSelectRoute(route)}
              className={`p-3 rounded-xl border transition-all ${route.status === "BLOCKED" ? "opacity-60 cursor-not-allowed border-red-200 dark:border-red-900/30" : "cursor-pointer hover:border-blue-400"} ${isActive ? "border-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1017]/80"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{route.type.replace('_', ' ')}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{route.timeMinutes} min</span>
                  <p className="text-[10px] text-slate-500">{route.distanceKm} km</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${statusColor}`}>
                    {route.status}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 max-w-[180px] truncate">{route.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-500">Safety Score</div>
                  <div className={`text-sm font-bold ${route.safetyScore > 80 ? 'text-emerald-500' : route.safetyScore > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                    {route.safetyScore}/100
                  </div>
                </div>
              </div>

              {route.status === "BLOCKED" && (
                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900/30 flex items-center gap-2 text-[10px] text-red-500">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Route changed because conditions changed.
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 text-[10px] text-slate-500 italic text-center">
        Route safety scores are model estimates and depend on data freshness.
      </div>
    </section>
  );
}
