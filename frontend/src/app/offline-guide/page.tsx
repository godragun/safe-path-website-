import Link from "next/link";
import { ArrowLeft, Battery, Droplets, HeartPulse, Radio, ShieldCheck } from "lucide-react";

const procedures = [
  { icon: ShieldCheck, title: "Move to higher ground", text: "Leave low-lying areas early. Never walk, swim, or drive through moving water." },
  { icon: Radio, title: "Stay informed", text: "Use SafePath alerts, local radio, and official emergency broadcasts for route changes." },
  { icon: Droplets, title: "Protect drinking water", text: "Store sealed water and avoid any floodwater that may contain sewage or chemicals." },
  { icon: Battery, title: "Pack a 72-hour kit", text: "Carry water, food, a flashlight, batteries, medication, documents, and a phone charger." },
  { icon: HeartPulse, title: "Check on others", text: "Help children, older adults, and anyone with mobility or medical needs without entering unsafe water." },
];

export default function OfflineGuidePage() {
  return <main className="min-h-screen bg-[#0b1017] px-5 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to command center</Link><div className="mt-12 border-b border-slate-800 pb-8"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef6a5b]">Offline survival guide</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">When the network goes quiet, the procedure remains.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Use these steps during a flash flood or severe storm. This page is cached by the SafePath service worker for offline access.</p></div><div className="mt-8 space-y-3">{procedures.map(({ icon: Icon, title, text }) => <article key={title} className="flex gap-4 border border-slate-800 bg-[#111923] p-5"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#69b7c4]" /><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{text}</p></div></article>)}</div><p className="mt-8 border-l-2 border-[#ef6a5b] px-4 py-3 text-sm leading-6 text-slate-300">If there is immediate danger, call your local emergency number. SafePath is an operational aid, not a replacement for emergency services.</p></div></main>;
}
