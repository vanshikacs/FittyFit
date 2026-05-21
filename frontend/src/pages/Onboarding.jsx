import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowRight, ArrowLeft, CheckCircle2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

const CONDITIONS = ["Diabetes", "Hypertension", "Heart Disease", "Arthritis", "Asthma", "Kidney", "Thyroid", "None"];
const LANGUAGES = ["Hindi", "English", "Hinglish", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];

export default function Onboarding() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [p, setP] = useState({
    age: "",
    gender: "",
    city: "",
    language: "Hindi",
    blood_group: "",
    chronic_conditions: [],
    allergies: "",
    dietary_restrictions: "",
    current_medications: "",
    emergency_contact: "",
    caregiver_contact: "",
    enable_voice_call: true,
    preferred_call_time: "08:00",
    enable_seasonal: true,
    enable_cultural: true,
  });

  const toggleCondition = (c) => {
    setP((prev) => ({
      ...prev,
      chronic_conditions: prev.chronic_conditions.includes(c)
        ? prev.chronic_conditions.filter((x) => x !== c)
        : [...prev.chronic_conditions, c],
    }));
  };

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...p,
        age: p.age ? parseInt(p.age) : null,
        allergies: p.allergies ? p.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        dietary_restrictions: p.dietary_restrictions ? p.dietary_restrictions.split(",").map((s) => s.trim()).filter(Boolean) : [],
        current_medications: p.current_medications ? p.current_medications.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      await api.put("/profile", payload);
      await refresh();
      toast.success("Profile saved!");
      nav("/dashboard");
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell-bg min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-navy text-lime flex items-center justify-center">
            <Stethoscope className="h-4 w-4" />
          </div>
          <span className="font-display font-black text-navy">Fittyfit</span>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full transition-all ${
                step >= n ? "bg-lime" : "bg-white/60"
              }`}
            />
          ))}
        </div>

        <div className="glass rounded-[32px] p-6 md:p-10" data-testid="onboarding-card">
          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Step {step} of 3</div>
            <h2 className="mt-1 font-display font-black text-3xl md:text-4xl text-navy">
              {step === 1 && `Hi ${user?.full_name?.split(" ")[0]}, tell us about you`}
              {step === 2 && "Your health profile"}
              {step === 3 && "Care preferences"}
            </h2>
          </div>

          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Text label="Age" v={p.age} onChange={(v) => setP({ ...p, age: v })} type="number" tid="ob-age" />
              <Select label="Gender" v={p.gender} onChange={(v) => setP({ ...p, gender: v })} opts={["Female", "Male", "Other"]} tid="ob-gender" />
              <Text label="City" v={p.city} onChange={(v) => setP({ ...p, city: v })} tid="ob-city" />
              <Select label="Preferred Language" v={p.language} onChange={(v) => setP({ ...p, language: v })} opts={LANGUAGES} tid="ob-language" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Select label="Blood Group" v={p.blood_group} onChange={(v) => setP({ ...p, blood_group: v })} opts={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} tid="ob-blood" />
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Chronic conditions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      data-testid={`ob-cond-${c.toLowerCase()}`}
                      onClick={() => toggleCondition(c)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                        p.chronic_conditions.includes(c)
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-navy border-slate-200 hover:border-navy"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Text label="Allergies (comma separated)" v={p.allergies} onChange={(v) => setP({ ...p, allergies: v })} tid="ob-allergies" />
              <Text label="Dietary restrictions" v={p.dietary_restrictions} onChange={(v) => setP({ ...p, dietary_restrictions: v })} tid="ob-dietary" />
              <Text label="Current medications" v={p.current_medications} onChange={(v) => setP({ ...p, current_medications: v })} tid="ob-meds" />
              <div className="grid md:grid-cols-2 gap-4">
                <Text label="Emergency contact" v={p.emergency_contact} onChange={(v) => setP({ ...p, emergency_contact: v })} tid="ob-emergency" />
                <Text label="Caregiver contact" v={p.caregiver_contact} onChange={(v) => setP({ ...p, caregiver_contact: v })} tid="ob-caregiver" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Toggle label="Enable daily voice health summary" v={p.enable_voice_call} onChange={(v) => setP({ ...p, enable_voice_call: v })} tid="ob-voice" />
              <Text label="Preferred call time (HH:MM)" v={p.preferred_call_time} onChange={(v) => setP({ ...p, preferred_call_time: v })} tid="ob-calltime" />
              <Toggle label="Seasonal recommendations" v={p.enable_seasonal} onChange={(v) => setP({ ...p, enable_seasonal: v })} tid="ob-seasonal" />
              <Toggle label="Cultural / festival mode" v={p.enable_cultural} onChange={(v) => setP({ ...p, enable_cultural: v })} tid="ob-cultural" />
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn-ghost disabled:opacity-40"
              data-testid="ob-back"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-cta" data-testid="ob-next">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={save} disabled={busy} className="btn-cta" data-testid="ob-finish">
                {busy ? "Saving…" : "Finish setup"} <CheckCircle2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Text({ label, v, onChange, type = "text", tid }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        data-testid={tid}
        type={type}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-navy outline-none text-navy"
      />
    </div>
  );
}

function Select({ label, v, onChange, opts, tid }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <select
        data-testid={tid}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-navy outline-none text-navy"
      >
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, v, onChange, tid }) {
  return (
    <button
      type="button"
      data-testid={tid}
      onClick={() => onChange(!v)}
      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white border border-slate-200 hover:border-navy text-left"
    >
      <span className="font-semibold text-navy">{label}</span>
      <span
        className={`h-6 w-11 rounded-full relative transition-all ${
          v ? "bg-lime" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-all ${
            v ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
