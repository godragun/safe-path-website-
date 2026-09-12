"use client";

import React, { useState } from "react";
import { X, AlertTriangle, MapPin, Send, Camera, Loader2, Navigation } from "lucide-react";
import { HazardPin } from "./OfflineMap";
import { supabase } from "@/lib/supabaseClient";
import { saveOfflineReport } from "@/lib/offlineStore";

interface ReportEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: HazardPin) => void;
}

export default function ReportEmergencyModal({ isOpen, onClose, onSubmit }: ReportEmergencyModalProps) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please ensure location services are enabled.");
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lat === "" || lng === "") {
      alert("Please provide GPS coordinates.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let imageUrl = "";
      const reportId = `report-${Date.now()}`;

      if (!navigator.onLine) {
        // OFFLINE MODE: Save to IndexedDB queue
        console.log("Device is offline. Queuing report locally.");
        // Note: For full offline image support, we would convert the file to Base64 here.
        // Keeping it simple for the resilience demo: just queue the text and coordinates.
        await saveOfflineReport({
          id: reportId,
          lat: Number(lat),
          lng: Number(lng),
          severity,
          description,
          timestamp: new Date().toISOString(),
          status: 'pending'
        });
        
        // Attempt to register background sync if supported
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const swRegistration = await navigator.serviceWorker.ready;
          (swRegistration as any).sync.register('sync-emergency-reports').catch(console.error);
        }

        alert("You are offline. Your report has been queued and will be sent when connectivity is restored.");
      } else {
        // ONLINE MODE: Submit to Supabase
        if (image) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("emergency-images")
            .upload(fileName, image);
            
          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from("emergency-images")
              .getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
          }
        }

        const { error: dbError } = await supabase
          .from('emergency_reports')
          .insert([{
            id: reportId,
            lat: Number(lat),
            lng: Number(lng),
            severity,
            description,
            image_url: imageUrl || null
          }]);

        if (dbError) {
          console.error("Database insert error:", dbError);
        }
      }

      const newReport: HazardPin = {
        id: reportId,
        lat: Number(lat),
        lng: Number(lng),
        severity,
        description,
        imageUrl: imageUrl || undefined,
        confidence: "LOW",
        reportCount: 1,
      };

      onSubmit(newReport);
      setDescription("");
      setLat("");
      setLng("");
      setImage(null);
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0a0e1a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Report Emergency</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Directly alert the command center</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* GPS Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Location</label>
            <div className="flex flex-col gap-2">
              <button 
                type="button" 
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="flex items-center justify-center gap-2 w-full p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm font-semibold"
              >
                {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                Use Current GPS Location
              </button>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <input 
                  type="number" 
                  step="any"
                  value={lat} 
                  onChange={(e) => setLat(parseFloat(e.target.value) || "")} 
                  placeholder="Latitude" 
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
                <input 
                  type="number" 
                  step="any"
                  value={lng} 
                  onChange={(e) => setLng(parseFloat(e.target.value) || "")} 
                  placeholder="Longitude" 
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={() => setSeverity("info")} className={`p-2 rounded-lg border text-sm font-semibold transition-all ${severity === "info" ? "bg-cyan-500/20 border-cyan-500 text-cyan-500 dark:text-cyan-400" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"}`}>Info</button>
              <button type="button" onClick={() => setSeverity("warning")} className={`p-2 rounded-lg border text-sm font-semibold transition-all ${severity === "warning" ? "bg-amber-500/20 border-amber-500 text-amber-500 dark:text-amber-400" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"}`}>Warning</button>
              <button type="button" onClick={() => setSeverity("critical")} className={`p-2 rounded-lg border text-sm font-semibold transition-all ${severity === "critical" ? "bg-red-500/20 border-red-500 text-red-500 dark:text-red-400" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"}`}>Critical</button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the situation..."
              className="w-full h-24 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none outline-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Attach Image (Optional)</label>
            <label className="flex items-center gap-3 w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1 truncate">
                {image ? (
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{image.name}</span>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">Click to upload photo</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-500/25 disabled:opacity-70 disabled:active:scale-100"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
