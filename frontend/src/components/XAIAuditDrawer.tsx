"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShieldCheck, ShieldAlert, Cpu,
  MapPin, CloudRain, Users, AlertTriangle, CheckCircle,
  Activity
} from "lucide-react";

export type AuditData = {
  id: string;
  verdict: "Confirmed" | "Needs Verification" | "Rejected";
  confidence_score: number;
  description: string;
  checks: {
    image_ai: { status: "Pass" | "Fail"; metric: string; desc: string };
    weather: { status: "Pass" | "Fail"; metric: string; desc: string };
    cluster: { status: "Pass" | "Fail"; metric: string; desc: string };
    location: { status: "Pass" | "Fail"; metric: string; desc: string };
    risk: { status: "High" | "Medium" | "Low"; metric: string; desc: string };
  };
};

interface XAIAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditData: AuditData | null;
}

export default function XAIAuditDrawer({ isOpen, onClose, auditData }: XAIAuditDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && auditData && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0d1117] border-l border-red-500/20 shadow-[_-20px_0_60px_rgba(99,102,241,0.1)] z-50 overflow-y-auto text-slate-200"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0d1117]/90 backdrop-blur-xl p-6 border-b border-slate-800 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Cpu className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="gradient-text">XAI Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-mono ml-11">CASE-{auditData.id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-all hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Verdict Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`rounded-xl p-5 border ${
                  auditData.verdict === "Confirmed"
                    ? "bg-emerald-950/30 border-emerald-500/30"
                    : auditData.verdict === "Rejected"
                    ? "bg-red-950/30 border-red-500/30"
                    : "bg-amber-950/30 border-amber-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Dempster-Shafer Fusion Result
                  </span>
                  <span
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      auditData.verdict === "Confirmed"
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                        : auditData.verdict === "Rejected"
                        ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                        : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
                    }`}
                  >
                    {auditData.verdict}
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-5xl font-black text-white font-mono tracking-tight">
                    {(auditData.confidence_score * 100).toFixed(1)}
                    <span className="text-lg text-slate-400">%</span>
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${auditData.confidence_score * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className={`h-full rounded-full ${
                      auditData.verdict === "Confirmed"
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                        : auditData.verdict === "Rejected"
                        ? "bg-gradient-to-r from-red-500 to-orange-400"
                        : "bg-gradient-to-r from-amber-500 to-yellow-400"
                    }`}
                  />
                </div>
                <p className="text-sm text-slate-400 mt-3">{auditData.description}</p>
              </motion.div>

              {/* 5 Parallel Checks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  Verification Pipeline
                </h3>
                <div className="space-y-3">
                  <CheckRow
                    icon={<ShieldCheck className="w-4 h-4 text-blue-400" />}
                    title="Multimodal Image AI"
                    status={auditData.checks.image_ai.status}
                    metric={auditData.checks.image_ai.metric}
                    desc={auditData.checks.image_ai.desc}
                    delay={0.15}
                  />
                  <CheckRow
                    icon={<CloudRain className="w-4 h-4 text-cyan-400" />}
                    title="Weather Telemetry"
                    status={auditData.checks.weather.status}
                    metric={auditData.checks.weather.metric}
                    desc={auditData.checks.weather.desc}
                    delay={0.2}
                  />
                  <CheckRow
                    icon={<Users className="w-4 h-4 text-purple-400" />}
                    title="Spatial Cluster (DBSCAN + H3)"
                    status={auditData.checks.cluster.status}
                    metric={auditData.checks.cluster.metric}
                    desc={auditData.checks.cluster.desc}
                    delay={0.25}
                  />
                  <CheckRow
                    icon={<MapPin className="w-4 h-4 text-emerald-400" />}
                    title="Location Anchor Match"
                    status={auditData.checks.location.status}
                    metric={auditData.checks.location.metric}
                    desc={auditData.checks.location.desc}
                    delay={0.3}
                  />
                  <CheckRow
                    icon={<AlertTriangle className="w-4 h-4 text-orange-400" />}
                    title="Infrastructure Risk Score"
                    status={auditData.checks.risk.status}
                    metric={auditData.checks.risk.metric}
                    desc={auditData.checks.risk.desc}
                    delay={0.35}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CheckRow({
  icon,
  title,
  status,
  metric,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  metric: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group bg-slate-900/60 rounded-lg p-4 border border-slate-800 hover:border-red-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-slate-800 rounded-md group-hover:bg-slate-700/80 transition-colors">
            {icon}
          </div>
          <span className="font-semibold text-sm text-slate-200">{title}</span>
        </div>
        {status === "Pass" || status === "Fail" ? (
          status === "Pass" ? (
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Pass</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase">Fail</span>
            </div>
          )
        ) : (
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              status === "High"
                ? "bg-red-900/40 text-red-400 ring-1 ring-red-500/30"
                : status === "Medium"
                ? "bg-orange-900/40 text-orange-400 ring-1 ring-orange-500/30"
                : "bg-blue-900/40 text-blue-400 ring-1 ring-blue-500/30"
            }`}
          >
            {status}
          </span>
        )}
      </div>
      <div className="text-xs font-mono text-red-300/80 mb-1 ml-9">{metric}</div>
      <div className="text-[11px] text-slate-500 leading-relaxed ml-9">{desc}</div>
    </motion.div>
  );
}
