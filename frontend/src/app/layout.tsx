import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0e1a]">{children}</body>
    </html>
  );
}
