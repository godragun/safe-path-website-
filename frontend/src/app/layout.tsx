import type { Metadata } from "next";
import { Manrope, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import { ThemeProvider } from "@/components/ThemeProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafePath — Disaster Response Command Center",
  description: "AI-powered urban flood response platform synthesizing crowdsourced hazard reports with meteorological telemetry for dynamic citizen routing and emergency dispatch.",
  keywords: "disaster response, flood detection, AI, emergency management, urban safety",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${outfit.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0b1017] transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PWARegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
