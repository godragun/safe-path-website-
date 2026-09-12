"use client";

import { useEffect } from "react";
import { getPendingReports, markReportSynced } from "@/lib/offlineStore";
import { supabase } from "@/lib/supabaseClient";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => console.warn("Service worker registration failed", error));
    }

    const syncOfflineReports = async () => {
      try {
        const pending = await getPendingReports();
        if (pending.length === 0) return;
        
        console.log(`Syncing ${pending.length} offline reports...`);
        for (const report of pending) {
          const { error } = await supabase.from('emergency_reports').insert([{
            id: report.id,
            lat: report.lat,
            lng: report.lng,
            severity: report.severity,
            description: report.description,
            image_url: report.imageUrl || null
          }]);

          if (!error) {
            await markReportSynced(report.id);
            console.log(`Successfully synced report ${report.id}`);
          }
        }
      } catch (err) {
        console.error("Error syncing offline reports:", err);
      }
    };

    window.addEventListener('online', syncOfflineReports);
    
    // Also try once on mount in case they came online before the app loaded
    if (navigator.onLine) {
      syncOfflineReports();
    }

    return () => {
      window.removeEventListener('online', syncOfflineReports);
    };
  }, []);
  
  return null;
}
