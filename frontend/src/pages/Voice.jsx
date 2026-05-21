import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PhoneCall, Play, Calendar, Languages, Waves, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Voice() {
  const [summary, setSummary] = useState(null);
  const [lang, setLang] = useState("Hindi");
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const { data } = await api.get("/voice/summary");
      setSummary(data);
      setLang(data.language || "Hindi");
    } catch {
      toast.error("Could not load summary");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const play = () => {
    if (!summary?.summary) return;
    if (!("speechSynthesis" in window)) {
      toast.error("Your browser doesn't support speech");
      return;
    }
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(summary.summary);
    u.rate = 0.9;
    u.pitch = 1;
    u.lang = lang === "Hindi" || lang === "Hinglish" ? "hi-IN" : "en-IN";
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-navy text-lime flex items-center justify-center">
          <PhoneCall className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Voice Health Summary</div>
          <h1 className="font-display font-black text-2xl text-navy">A gentle call, every morning.</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Big player */}
        <div className="lg:col-span-3 glass rounded-[32px] p-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-lime/30 blur-3xl" />
          <div className="relative">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's summary · {summary?.date}</div>
            <div className="mt-2 flex items-start gap-5">
              <button
                onClick={play}
                data-testid="voice-summary-play"
                disabled={busy || !summary?.summary}
                className="h-24 w-24 rounded-full bg-lime text-navy flex items-center justify-center shadow-cta hover:bg-lime-hover shrink-0 transition-all hover:scale-105"
              >
                <Play className="h-10 w-10 ml-1" fill="currentColor" />
              </button>
              <div className="flex-1">
                <div className="font-display font-black text-3xl text-navy leading-tight">
                  {playing ? "Playing your voice summary…" : "Listen to your daily summary"}
                </div>
                <div className="flex items-center gap-2 mt-3 text-slate-500 text-sm">
                  <Waves className="h-4 w-4" /> 60 seconds · {lang}
                </div>
              </div>
            </div>
            <div className="mt-7 p-5 rounded-2xl bg-white border border-slate-100" data-testid="voice-summary-text">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Transcript</div>
              <p className="text-lg leading-relaxed text-navy">
                {busy ? "Preparing your summary…" : summary?.summary || "Namaste 🙏 Generating today's voice summary…"}
              </p>
            </div>
            <div className="mt-5 flex gap-3 flex-wrap">
              <button onClick={load} disabled={busy} className="btn-dark !text-sm">
                <Sparkles className="h-4 w-4" /> {busy ? "Generating…" : "Regenerate"}
              </button>
              <button data-testid="voice-call-now" className="btn-ghost !text-sm" onClick={() => toast.info("Demo: calling you now…")}>
                <PhoneCall className="h-4 w-4" /> Call me now
              </button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Calendar className="h-4 w-4" /> Schedule
            </div>
            <h3 className="mt-2 font-display font-extrabold text-xl text-navy">Daily call time</h3>
            <div className="mt-3 font-display font-black text-4xl text-navy">7:30 AM</div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="chip !text-xs !py-1">{d}</span>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Languages className="h-4 w-4" /> Language
            </div>
            <select
              data-testid="voice-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="mt-3 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none text-navy font-bold"
            >
              {["Hindi", "Hinglish", "English", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="glass-dark rounded-3xl p-6">
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Sample · Hindi</div>
            <p className="mt-2 text-lg leading-relaxed">
              "Namaste Shanti Devi ji, aaj aapki do medicines due hain. Garmi zyada hai, paani zyada piyen. Aaj meetha avoid karein. Khayal rakhein."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
