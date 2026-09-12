"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Users, Gauge, Radio, TrendingUp, ShieldAlert } from "lucide-react";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  delay?: number;
}

function StatsCard({ icon, label, value, subtitle, color, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-panel rounded-xl p-4 hover:border-indigo-500/20 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
      </div>
      <div className="text-3xl font-black text-white font-mono tracking-tight">{value}</div>
      {subtitle && <div className="text-[11px] text-slate-500 mt-1">{subtitle}</div>}
    </motion.div>
  );
}

interface StatsPanelProps {
  totalReports: number;
  confirmedHazards: number;
  maxGaugeLevel: number;
  activeWarnings: number;
  timeElapsed: number;
  clustersFound: number;
}

export default function StatsPanel({
  totalReports,
  confirmedHazards,
  maxGaugeLevel,
  activeWarnings,
  timeElapsed,
  clustersFound,
}: StatsPanelProps) {
  const gaugeColor = maxGaugeLevel > 4.5 ? "text-red-400" : maxGaugeLevel > 3.0 ? "text-amber-400" : "text-cyan-400";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatsCard
        icon={<Users className="w-4 h-4 text-indigo-400" />}
        label="Total Reports"
        value={totalReports}
        subtitle="citizen submissions"
        color="bg-indigo-500/10"
        delay={0}
      />
      <StatsCard
        icon={<ShieldAlert className="w-4 h-4 text-emerald-400" />}
        label="Confirmed"
        value={confirmedHazards}
        subtitle="hazards verified"
        color="bg-emerald-500/10"
        delay={0.05}
      />
      <StatsCard
        icon={<Gauge className={`w-4 h-4 ${gaugeColor}`} />}
        label="Peak Gauge"
        value={`${maxGaugeLevel.toFixed(1)}m`}
        subtitle={maxGaugeLevel > 4.5 ? "⚠ BREACH LEVEL" : "river level"}
        color={maxGaugeLevel > 4.5 ? "bg-red-500/10" : "bg-cyan-500/10"}
        delay={0.1}
      />
      <StatsCard
        icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        label="Warnings"
        value={activeWarnings}
        subtitle="active alerts"
        color="bg-amber-500/10"
        delay={0.15}
      />
      <StatsCard
        icon={<Radio className="w-4 h-4 text-purple-400" />}
        label="Clusters"
        value={clustersFound}
        subtitle="spatial groups"
        color="bg-purple-500/10"
        delay={0.2}
      />
      <StatsCard
        icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
        label="Sim Time"
        value={`${timeElapsed}m`}
        subtitle="elapsed"
        color="bg-cyan-500/10"
        delay={0.25}
      />
    </div>
  );
}
