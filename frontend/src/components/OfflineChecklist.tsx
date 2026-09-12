"use client";

import { CheckCircle2, CloudOff, Loader2 } from "lucide-react";

interface OfflineChecklistProps {
  isPrepared: boolean;
  isDownloading: boolean;
}

export default function OfflineChecklist({ isPrepared, isDownloading }: OfflineChecklistProps) {
  if (isDownloading) {
    return (
      <div className="bg-slate-50 dark:bg-[#0b1017] p-4 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Preparing Emergency Pack...</h3>
        </div>
        <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <li className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Saving safe locations</li>
          <li className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Storing emergency contacts</li>
          <li className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Caching routes & map data</li>
          <li className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Preparing offline SOS queue</li>
        </ul>
      </div>
    );
  }

  if (isPrepared) {
    return (
      <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">YOUR DEVICE IS PREPARED</h3>
        </div>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mb-3 leading-snug">
          SafePath has enough emergency information stored locally to continue operating during a connectivity outage.
        </p>
        <ul className="space-y-1.5 text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Emergency Pack downloaded</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Emergency contacts stored</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Shelters & Hospitals stored</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Hazard data stored</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Safe routes available</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> SOS queue ready</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
      <div className="flex items-center gap-3 mb-2">
        <CloudOff className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Not Prepared</h3>
      </div>
      <p className="text-[10px] text-slate-500">
        You have not downloaded an emergency pack for your area. If connectivity is lost, you will not have access to offline maps and shelters.
      </p>
    </div>
  );
}
