"use client";

import Link from "next/link";
import { Shield, ArrowRight, UserPlus, LogIn, BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1017] flex flex-col items-center justify-center p-6 text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 text-center animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ef6a5b]/10 dark:bg-[#ef6a5b]/15 text-[#ef6a5b] border border-[#ef6a5b]/20 dark:border-[#ef6a5b]/30 shadow-[0_0_30px_rgba(239,106,91,0.1)] dark:shadow-[0_0_30px_rgba(239,106,91,0.2)]">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            SafePath
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            AI-powered urban flood response & disaster management platform.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-8">
          <Link
            href="/login"
            className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5 text-slate-400" />
            Sign In
          </Link>

          <Link
            href="/signup"
            className="flex items-center justify-center gap-3 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5 text-slate-400" />
            Create Account
          </Link>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 dark:bg-[#0b1017] px-4 text-slate-500 uppercase tracking-widest font-bold">Or</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-[0.98]"
          >
            Continue as Guest
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Link
              href="/survival"
              className="flex flex-col items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5 text-red-500" />
              <span className="text-sm">Survival Center</span>
            </Link>
            <Link
              href="/survival-kit"
              className="flex flex-col items-center justify-center gap-2 w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-[0.98]"
            >
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-sm">Survival Kit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
