"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Clock, ShieldCheck, Activity } from "lucide-react";

interface Task {
  task: string;
  condition: string;
}

interface AutopilotPlan {
  summary: string;
  tasks: Task[];
}

export default function PreDisasterAutopilot({ riskData }: { riskData: any }) {
  const [plan, setPlan] = useState<AutopilotPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If PredictionEngine passed the plan down directly, we use it. 
    // Usually it would fetch if not provided.
    if (riskData && riskData.autopilot) {
      setPlan(riskData.autopilot);
    }
  }, [riskData]);

  if (!plan && !loading) {
    return (
      <section className="glass-panel-heavy bg-white dark:bg-transparent rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/50">
         <div className="flex items-center gap-2 text-slate-500">
           <ShieldCheck className="w-5 h-5" />
           <span className="text-sm">Run prediction to generate Pre-Disaster Autopilot plan.</span>
         </div>
      </section>
    );
  }

  return (
    <section className="glass-panel-heavy bg-white dark:bg-transparent rounded-xl p-4 shadow-xl border border-slate-200 dark:border-slate-700/50 animate-fade-in">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Preparation Engine</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">Pre-Disaster Autopilot</h2>
        </div>
        <CheckSquare className="h-4 w-4 text-emerald-400" />
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
        {plan?.summary}
      </p>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
        {plan?.tasks.map((t, idx) => {
          let conditionColor = "bg-slate-500";
          if (t.condition.includes("NOW")) conditionColor = "bg-emerald-500";
          else if (t.condition.includes("70") || t.condition.includes("WARNING")) conditionColor = "bg-amber-500";
          else if (t.condition.includes("OFFICIAL") || t.condition.includes("CRITICAL")) conditionColor = "bg-red-500";

          return (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-4 h-4 rounded-full border-4 border-white dark:border-[#111923] ${conditionColor} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10`}></div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white dark:bg-[#0b1017]/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow">
                <div className="flex items-center justify-between mb-1">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${conditionColor.replace('bg-', 'text-')}`}>
                    {t.condition}
                  </div>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
                  {t.task}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
