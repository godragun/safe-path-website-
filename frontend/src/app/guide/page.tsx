import React from "react";
import { BookOpen, Droplets, Flame, Wind, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OfflineGuide() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-red-500" />
              Offline Survival Guide
            </h1>
            <p className="text-slate-400 mt-2">Cached locally. Available without internet access.</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Command
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Flood */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Droplets className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">Flash Flooding</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span>1.</span> <strong>Move to higher ground immediately.</strong> Do not wait for instructions if water is rising.</li>
              <li className="flex gap-2"><span>2.</span> <strong>Never drive through floodwaters.</strong> Turn Around, Don&apos;t Drown. 6 inches of water stalls engines.</li>
              <li className="flex gap-2"><span>3.</span> <strong>Disconnect utilities.</strong> Turn off main power and gas if your building is threatened.</li>
              <li className="flex gap-2"><span>4.</span> Avoid wading in water; it may be electrically charged or contaminated.</li>
            </ul>
          </section>

          {/* Fire */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold">Wildfire / Urban Fire</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2"><span>1.</span> <strong>Evacuate early.</strong> Do not wait until fire is visible. Follow designated routes.</li>
              <li className="flex gap-2"><span>2.</span> <strong>Wear protective clothing.</strong> Long sleeves, pants, and N95 masks if available.</li>
              <li className="flex gap-2"><span>3.</span> Close all windows and doors to prevent drafts that pull fire inside.</li>
              <li className="flex gap-2"><span>4.</span> Leave exterior lights on so emergency personnel can see your house through smoke.</li>
            </ul>
          </section>

          {/* Wind */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-400/30 transition-colors md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-slate-500/10 rounded-xl">
                <Wind className="w-6 h-6 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold">Severe Storm / Hurricane</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
              <ul className="space-y-3">
                <li className="flex gap-2"><span>1.</span> Stay indoors, away from windows and glass doors.</li>
                <li className="flex gap-2"><span>2.</span> Keep a 72-hour emergency kit (water, non-perishable food, flashlights) easily accessible.</li>
              </ul>
              <ul className="space-y-3">
                <li className="flex gap-2"><span>3.</span> Monitor battery-powered radio for official updates.</li>
                <li className="flex gap-2"><span>4.</span> Take refuge in a small interior room, closet, or hallway on the lowest level.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
