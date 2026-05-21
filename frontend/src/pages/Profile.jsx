import React from "react";
import { useAuth } from "@/lib/auth";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Heart, Pill, AlertCircle, Settings, Edit } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const p = user?.profile || {};

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4 flex-wrap">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-sky-glow to-lime flex items-center justify-center">
          <span className="font-display font-black text-3xl text-navy">
            {user?.full_name?.[0]}
          </span>
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{user?.role}</div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-navy">{user?.full_name}</h1>
          <div className="text-slate-600 text-sm">{user?.email}</div>
        </div>
        <Link to="/onboarding" className="btn-ghost !text-sm" data-testid="profile-edit">
          <Edit className="h-4 w-4" /> Edit profile
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Basic info</div>
          <div className="mt-4 space-y-3">
            <Row icon={User} label="Age" value={p.age || "—"} />
            <Row icon={User} label="Gender" value={p.gender || "—"} />
            <Row icon={Phone} label="Phone" value={user?.phone} />
            <Row icon={Mail} label="Email" value={user?.email} />
            <Row icon={Settings} label="Language" value={p.language} />
            <Row icon={Settings} label="City" value={p.city || "—"} />
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Health profile</div>
          <div className="mt-4 space-y-3">
            <Row icon={Heart} label="Blood group" value={p.blood_group || "—"} />
            <Row icon={AlertCircle} label="Chronic conditions" value={(p.chronic_conditions || []).join(", ") || "None"} />
            <Row icon={AlertCircle} label="Allergies" value={(p.allergies || []).join(", ") || "None"} />
            <Row icon={Pill} label="Current medications" value={(p.current_medications || []).join(", ") || "None"} />
            <Row icon={Phone} label="Emergency contact" value={p.emergency_contact || "—"} />
            <Row icon={Phone} label="Caregiver contact" value={p.caregiver_contact || "—"} />
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferences</div>
        <div className="mt-4 grid md:grid-cols-4 gap-3">
          <Pref label="Voice calls" on={p.enable_voice_call} />
          <Pref label="Seasonal mode" on={p.enable_seasonal} />
          <Pref label="Cultural mode" on={p.enable_cultural} />
          <Pref label="Call time" value={p.preferred_call_time || "08:00"} />
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-xl bg-sky-glow flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-navy" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-navy font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Pref({ label, on, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-display font-bold text-navy">
        {value ? value : on ? "Enabled" : "Disabled"}
      </div>
    </div>
  );
}
