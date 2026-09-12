"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Shield, CheckCircle2, Circle, Droplets, Utensils, HeartPulse, Flashlight, Radio, FileText, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type KitItem = {
  id: string;
  name: string;
  reason: string;
  quantity: string;
  category: string;
};

type KitCategory = {
  category: string;
  icon: React.ReactNode;
  items: KitItem[];
};

const BASE_KIT_DATA: KitCategory[] = [
  {
    category: "WATER",
    icon: <Droplets className="w-5 h-5" />,
    items: [
      { id: "w1", name: "Drinking Water", reason: "Essential for survival", quantity: "1 gallon per person per day", category: "WATER" },
      { id: "w2", name: "Water Filter", reason: "To purify found water", quantity: "1 portable filter", category: "WATER" }
    ]
  },
  {
    category: "FOOD",
    icon: <Utensils className="w-5 h-5" />,
    items: [
      { id: "f1", name: "Non-perishable Food", reason: "Sustenance during isolation", quantity: "3-day supply", category: "FOOD" },
      { id: "f2", name: "Can Opener", reason: "To open canned goods", quantity: "1 manual opener", category: "FOOD" }
    ]
  },
  {
    category: "FIRST AID",
    icon: <HeartPulse className="w-5 h-5" />,
    items: [
      { id: "fa1", name: "First Aid Kit", reason: "Treat minor injuries", quantity: "1 comprehensive kit", category: "FIRST AID" },
      { id: "fa2", name: "Prescription Medications", reason: "Maintain health conditions", quantity: "7-day supply", category: "FIRST AID" }
    ]
  },
  {
    category: "LIGHT",
    icon: <Flashlight className="w-5 h-5" />,
    items: [
      { id: "l1", name: "Flashlight", reason: "Visibility during power outages", quantity: "1 per person", category: "LIGHT" },
      { id: "l2", name: "Extra Batteries", reason: "Keep lights working", quantity: "2 extra sets", category: "LIGHT" }
    ]
  },
  {
    category: "COMMUNICATION",
    icon: <Radio className="w-5 h-5" />,
    items: [
      { id: "c1", name: "Battery/Hand-crank Radio", reason: "Receive emergency broadcasts", quantity: "1 NOAA weather radio", category: "COMMUNICATION" },
      { id: "c2", name: "Whistle", reason: "Signal for help", quantity: "1 per person", category: "COMMUNICATION" }
    ]
  },
  {
    category: "DOCUMENTS",
    icon: <FileText className="w-5 h-5" />,
    items: [
      { id: "d1", name: "Important Documents", reason: "Identification and insurance", quantity: "1 waterproof bag", category: "DOCUMENTS" }
    ]
  }
];

function SurvivalKitContent() {
  const searchParams = useSearchParams();
  const disasterContext = searchParams.get("context") || "general";
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeKitData, setActiveKitData] = useState<KitCategory[]>(BASE_KIT_DATA);
  const [isAiLoading, setIsAiLoading] = useState(true);

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem("safepath_kit_progress");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  // Fetch AI dynamic items
  useEffect(() => {
    async function fetchAiItems() {
      setIsAiLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/survival-kit?context=${disasterContext}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            // Merge AI items into base categories or create new ones
            const newKitData = [...BASE_KIT_DATA];
            
            data.items.forEach((aiItem: KitItem) => {
              // Mark AI items to style them differently
              const itemToAdd = { ...aiItem, isAiGenerated: true };
              
              const categoryIndex = newKitData.findIndex(c => c.category === aiItem.category);
              if (categoryIndex >= 0) {
                newKitData[categoryIndex] = {
                  ...newKitData[categoryIndex],
                  items: [...newKitData[categoryIndex].items, itemToAdd]
                };
              } else {
                newKitData.push({
                  category: aiItem.category,
                  icon: <Sparkles className="w-5 h-5 text-purple-500" />,
                  items: [itemToAdd]
                });
              }
            });
            setActiveKitData(newKitData);
          }
        }
      } catch (error) {
        console.error("Failed to load AI items:", error);
      } finally {
        setIsAiLoading(false);
      }
    }
    
    fetchAiItems();
  }, [disasterContext]);

  const toggleItem = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem("safepath_kit_progress", JSON.stringify(next));
  };

  const totalItems = activeKitData.reduce((acc, cat) => acc + cat.items.length, 0);
  const packedItems = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  // Auto-scroll images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ["/images/survival-kit.jpg", "/images/survival-kit-2.jpg", "/images/survival-kit-3.jpg"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-[#0b1017] glass-panel-heavy sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/survival" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight sm:text-lg">Build My Survival Kit</h1>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 animate-fade-in pb-24">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="w-full md:w-1/2 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative h-64 sm:h-80">
            {images.map((img, idx) => (
              <img 
                key={img}
                src={img} 
                alt={`Survival Kit \${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 \${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
              />
            ))}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full \${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Be Prepared.<br/>Not Scared.</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Assemble these essential items before an emergency happens. 
              {disasterContext !== 'general' && <span className="text-red-500 font-bold ml-1">Tailored for a {disasterContext} in Sri Lanka.</span>}
            </p>
            
            {/* Progress Bar */}
            <div className="bg-white dark:bg-[#111923] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              {isAiLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#111923]/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Consulting AI for Sri Lanka context...
                  </div>
                </div>
              )}
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kit Progress</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{packedItems} / {totalItems} items ready</p>
                </div>
                <div className="text-xl font-bold text-red-500">{progressPercent}%</div>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-8">
          {activeKitData.map((category) => (
            <div key={category.category} className="bg-white dark:bg-[#111923] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="text-red-500">{category.icon}</div>
                <h3 className="text-lg font-bold tracking-wider">{category.category}</h3>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {category.items.map((item: any) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item.id)}
                      className={`p-4 sm:p-6 flex items-start gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors \${isChecked ? 'opacity-75' : ''} \${item.isAiGenerated ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''}`}
                    >
                      <div className="mt-1 shrink-0 transition-transform active:scale-90">
                        {isChecked ? (
                          <CheckCircle2 className="w-6 h-6 text-red-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                          <h4 className={`text-base font-bold flex items-center gap-2 transition-colors \${isChecked ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                            {item.name}
                            {item.isAiGenerated && <Sparkles className="w-3 h-3 text-purple-500" />}
                          </h4>
                          <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md shrink-0">
                            {item.quantity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SurvivalKit() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] flex items-center justify-center font-bold">Loading SafePath...</div>}>
      <SurvivalKitContent />
    </Suspense>
  );
}
