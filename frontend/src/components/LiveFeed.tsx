"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Droplets, TreePine, MapPin, Clock } from "lucide-react";

export interface FeedItem {
  id: string;
  description: string;
  ward_id: string;
  timestamp: string;
  type: "report" | "gauge" | "warning";
}

interface LiveFeedProps {
  items: FeedItem[];
}

function getIcon(type: string) {
  switch (type) {
    case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    case "gauge": return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
    default: return <MapPin className="w-3.5 h-3.5 text-indigo-400" />;
  }
}

function getBorderColor(type: string) {
  switch (type) {
    case "warning": return "border-l-red-500";
    case "gauge": return "border-l-cyan-500";
    default: return "border-l-indigo-500";
  }
}

export default function LiveFeed({ items }: LiveFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [items.length]);

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Live Feed</span>
        </div>
        <span className="text-[10px] font-mono text-slate-600">{items.length} events</span>
      </div>

      {/* Feed Items */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={item.id + i}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{ duration: 0.3 }}
              className={`bg-slate-900/50 rounded-lg p-3 border-l-2 ${getBorderColor(item.type)} hover:bg-slate-800/50 transition-colors cursor-pointer`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1 bg-slate-800 rounded">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed truncate">{item.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-500/60">
                      {item.ward_id}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Droplets className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-xs">Awaiting incoming data...</span>
          </div>
        )}
      </div>
    </div>
  );
}
