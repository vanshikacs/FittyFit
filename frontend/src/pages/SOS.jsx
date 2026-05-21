import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Siren, Phone, MapPin, Heart, Pill, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SOS() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [location, setLocation] = useState("Fetching location…");

  useEffect(() => {
    api.get("/sos/history").then(({ data }) => setHistory(data)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`),
        () => setLocation(user?.profile?.city || "Location unavailable")
      );
    } else {
      setLocation(user?.profile?.city || "Unknown");
    }
  }, [user]);

  const trigger = async () => {
    if (status === "sending") return;
    setStatus("sending");
    try {
      await api.post("/sos", { location });
      setStatus("sent");
      toast.success("SOS sent — caregiver notified");
      const { data } = await api.get("/sos/history");
      setHistory(data);
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("idle");
      toast.error("Failed to send SOS");
    }
  };

  const p = user?.profile || {};
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-red-500 text-white flex items-center justify-center animate-pulse-sos">
          <Siren className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">Emergency SOS</div>
          <h1 className="font-display font-black text-2xl text-navy">One tap, immediate help.</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-[32px] p-8 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-red-200/50 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">
              {status === "sent" ? "SOS delivered" : "Press the button to alert caregiver"}
            </div>
            <button
              onClick={trigger}
              data-testid="sos-emergency-button"
              disabled={status === "sending"}
              className={`mt-6 mx-auto h-48 w-48 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-sos transition-all flex flex-col items-center justify-center gap-2 ${
                status === "idle" ? "animate-pulse-sos" : ""
              } ${status === "sending" ? "scale-95 opacity-80" : ""}`}
            >
              {status === "sent" ? (
                <>
                  <CheckCircle2 className="h-14 w-14" />
                  <span className="font-display font-black text-xl">Sent</span>
                </>
              ) : (
                <>
                  <Siren className="h-14 w-14" />
                  <span className="font-display font-black text-2xl">
                    {status === "sending" ? "Sending…" : "SOS"}
                  </span>
                </>
              )}
            </button>
            <p className="mt-6 text-slate-600 max-w-md mx-auto">
              Your caregiver and family will be notified with your blood group, current medications, and last known location.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <InfoCard icon={Phone} title="Emergency contact" value={p.emergency_contact || "Not set"} tid="sos-emergency-contact" />
          <InfoCard icon={Phone} title="Caregiver" value={p.caregiver_contact || "Not set"} tid="sos-caregiver" />
          <InfoCard icon={Heart} title="Blood group" value={p.blood_group || "Unknown"} tid="sos-blood" />
          <InfoCard icon={Pill} title="Current meds" value={(p.current_medications || []).join(", ") || "None recorded"} tid="sos-meds" />
          <InfoCard icon={MapPin} title="Last location" value={location} tid="sos-location" />
        </div>
      </div>

      {/* History */}
      <div className="glass rounded-3xl p-6">
        <h3 className="font-display font-extrabold text-xl text-navy">SOS history</h3>
        <div className="mt-4 space-y-2">
          {history.length === 0 && (
            <div className="text-slate-500 text-sm">No emergencies triggered yet. Stay safe.</div>
          )}
          {history.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <div className="font-bold text-navy text-sm">SOS · {e.status}</div>
                <div className="text-xs text-slate-500">{e.location} · {new Date(e.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, tid }) {
  return (
    <div data-testid={tid} className="glass rounded-3xl p-5 flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-sky-glow flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-navy" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</div>
        <div className="font-display font-bold text-navy truncate">{value}</div>
      </div>
    </div>
  );
}
