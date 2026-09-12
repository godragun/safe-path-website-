"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// Mock database of disaster guides. In a real app, this would come from an API/CMS.
const guidesData: Record<string, any> = {
  earthquake: {
    name: "Earthquake",
    heroImage: "/images/earthquake.jpg",
    riskColor: "amber",
    sections: {
      before: [
        { id: "eq-b1", title: "Secure Heavy Items", desc: "Fasten shelves, mirrors, and large frames to walls." },
        { id: "eq-b2", title: "Identify Safe Spots", desc: "Find sturdy tables or interior walls in every room." }
      ],
      during: [
        { id: "eq-d1", title: "DROP", desc: "Drop to your hands and knees immediately." },
        { id: "eq-d2", title: "COVER", desc: "Cover your head and neck under a sturdy desk or table." },
        { id: "eq-d3", title: "HOLD ON", desc: "Hold on to your shelter until the shaking stops." },
        { id: "eq-d4", title: "Stay Inside", desc: "Do not run outside. Do not use elevators." }
      ],
      after: [
        { id: "eq-a1", title: "Check for Injuries", desc: "Administer first aid if necessary. Do not move seriously injured persons unless they are in immediate danger." },
        { id: "eq-a2", title: "Evacuate if Damaged", desc: "If the building is damaged, leave carefully. Watch for falling debris." }
      ]
    }
  },
  flood: {
    name: "Flood",
    heroImage: "/images/flood.jpg",
    riskColor: "cyan",
    sections: {
      before: [
        { id: "fl-b1", title: "Know Your Risk", desc: "Identify if you live in a flood-prone area." },
        { id: "fl-b2", title: "Prepare Go-Bag", desc: "Have emergency supplies packed and ready." }
      ],
      during: [
        { id: "fl-d1", title: "Move to Higher Ground", desc: "Immediately move to higher ground or a higher floor." },
        { id: "fl-d2", title: "Do NOT Walk Through Water", desc: "Just 6 inches of moving water can knock you down." },
        { id: "fl-d3", title: "Do NOT Drive", desc: "Turn around, don't drown. Vehicles can be swept away in 12 inches of water." }
      ],
      after: [
        { id: "fl-a1", title: "Wait for All-Clear", desc: "Return home only when authorities indicate it is safe." },
        { id: "fl-a2", title: "Avoid Standing Water", desc: "Water may be contaminated by oil, gasoline, or raw sewage." }
      ]
    }
  },
  wildfire: {
    name: "Wildfire",
    heroImage: "/images/wildfire.jpg",
    riskColor: "red",
    sections: {
      before: [
        { id: "wf-b1", title: "Create Defensible Space", desc: "Clear flammable vegetation around your home." }
      ],
      during: [
        { id: "wf-d1", title: "Evacuate Immediately", desc: "Leave as soon as evacuation orders are given." },
        { id: "wf-d2", title: "Wear Protective Clothing", desc: "Wear long sleeves, pants, and sturdy shoes." },
        { id: "wf-d3", title: "Protect Your Airways", desc: "Wear an N95 mask to avoid breathing in dangerous smoke." }
      ],
      after: [
        { id: "wf-a1", title: "Listen to Authorities", desc: "Do not return home until the area is declared safe." }
      ]
    }
  },
  cyclone: {
    name: "Cyclone",
    heroImage: "/images/cyclone.jpg",
    riskColor: "blue",
    sections: {
      before: [
        { id: "cy-b1", title: "Secure Property", desc: "Bring in loose outdoor items. Board up windows if advised." }
      ],
      during: [
        { id: "cy-d1", title: "Stay Indoors", desc: "Stay away from windows and glass doors." },
        { id: "cy-d2", title: "Take Refuge", desc: "Move to an interior room on the lowest floor." },
        { id: "cy-d3", title: "Beware the Eye", desc: "The storm is not over if the wind suddenly drops. The second half of the storm will hit soon." }
      ],
      after: [
        { id: "cy-a1", title: "Stay Away from Power Lines", desc: "Report downed lines to the power company immediately." }
      ]
    }
  }
};

export default function DisasterGuide() {
  const params = useParams();
  const disasterId = params.disaster as string;
  const guide = guidesData[disasterId];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (disasterId) {
      const saved = localStorage.getItem(`safepath_guide_${disasterId}`);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
      setIsLoaded(true);
    }
  }, [disasterId]);

  if (!guide || !isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] flex items-center justify-center">
        <div className="text-slate-500">Loading guide...</div>
      </div>
    );
  }

  const toggleItem = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem(`safepath_guide_${disasterId}`, JSON.stringify(next));
  };

  const allTasks = [...guide.sections.before, ...guide.sections.during, ...guide.sections.after];
  const totalTasks = allTasks.length;
  const completedTasks = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const renderSection = (title: string, items: any[], phase: "before" | "during" | "after") => (
    <div className="mb-10 last:mb-0">
      <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-slate-900 dark:text-white border-l-4 pl-4 border-red-500">
        {title}
      </h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          const isChecked = !!checkedItems[item.id];
          return (
            <div 
              key={item.id} 
              onClick={() => toggleItem(item.id)}
              className={`bg-white dark:bg-[#111923] p-4 sm:p-6 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md
                \${isChecked ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="shrink-0 mt-1">
                  {isChecked ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                      <span className="text-xs sm:text-sm font-bold text-slate-400">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`text-lg sm:text-xl font-bold mb-2 \${isChecked ? 'text-slate-600 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-sm sm:text-base \${isChecked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0b1017]/80 backdrop-blur-md sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/survival" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">{guide.name} Guide</h1>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 w-full pb-24">
        {/* Hero Image */}
        <div className="w-full h-48 sm:h-64 md:h-80 relative overflow-hidden">
          <img src={guide.heroImage} alt={guide.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1017] via-[#0b1017]/60 to-transparent dark:from-[#0b1017] dark:via-[#0b1017]/60 dark:to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 uppercase">
              {guide.name}
            </h2>
            <p className="text-slate-300 font-bold uppercase tracking-widest text-sm">
              Official Safety Protocol
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-8 mt-8">
          {/* Progress Alert */}
          <div className="mb-12 bg-white dark:bg-[#111923] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-1">Safety Checklist Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Complete these steps to maximize your safety.</p>
            </div>
            <div className="w-full sm:w-1/2 flex items-center gap-4">
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-bold font-mono min-w-[3rem]">{completedTasks}/{totalTasks}</span>
            </div>
          </div>

          {/* Guide Sections */}
          {renderSection("Before", guide.sections.before, "before")}
          {renderSection("During", guide.sections.during, "during")}
          {renderSection("After", guide.sections.after, "after")}
          
        </div>
      </main>
    </div>
  );
}
