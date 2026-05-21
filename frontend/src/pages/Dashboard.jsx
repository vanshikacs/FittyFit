import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Pill,
  Salad,
  MessageSquareHeart,
  PhoneCall,
  BellRing,
  Siren,
  Sparkles,
  ArrowUpRight,
  Activity,
  Sun,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/dashboard");
      setData(data);
    } catch (e) {
      toast.error("Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const adherence = data?.adherence ?? 100;
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Greeting strip */}
      <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{today}</div>
          <h1 className="mt-1 font-display font-black text-3xl md:text-5xl text-navy" data-testid="dashboard-greeting">
            {greet()}, {firstName} ji
          </h1>
          <p className="mt-2 text-slate-600">Here's your care snapshot for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/sos" data-testid="dashboard-sos" className="inline-flex items-center gap-2 bg-red-500 text-white font-bold rounded-full px-5 py-3 animate-pulse-sos hover:bg-red-600">
            <Siren className="h-4 w-4" /> SOS
          </Link>
          <Link to="/coach" className="btn-cta">
            Ask AI Coach <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          tid="stat-adherence"
          icon={Activity}
          label="Medication Adherence"
          value={`${adherence}%`}
          tone="light"
          hint="Last 7 days"
        />
        <StatCard
          tid="stat-meds"
          icon={Pill}
          label="Active Medicines"
          value={data?.medications?.length ?? 0}
          tone="light"
          hint="Scheduled today"
        />
        <StatCard
          tid="stat-alerts"
          icon={BellRing}
          label="Open Alerts"
          value={data?.unread_alerts?.length ?? 0}
          tone="dark"
          hint="Awaiting caregiver"
        />
        <StatCard
          tid="stat-status"
          icon={ShieldCheck}
          label="Care Status"
          value="All good"
          tone="lime"
          hint="No risks detected"
        />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Upcoming meds */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Summary</div>
              <h3 className="mt-1 font-display font-extrabold text-2xl text-navy">Upcoming medicines</h3>
            </div>
            <Link to="/medications" className="text-sm font-bold text-navy underline-offset-4 hover:underline">
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {(data?.medications || []).slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-sky-glow flex items-center justify-center">
                  <Pill className="h-5 w-5 text-navy" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-navy">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.dosage} · {m.frequency}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-navy">
                    <Clock className="h-3 w-3" /> {m.time}
                  </div>
                </div>
              </div>
            ))}
            {(!data?.medications || data.medications.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                No medicines added yet. <Link to="/medications" className="font-bold text-navy underline">Add one</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <QuickAction to="/coach" tid="qa-coach" icon={MessageSquareHeart} title="Ask AI Coach" desc="Diet, meds, symptoms" tone="dark" />
          <QuickAction to="/food" tid="qa-food" icon={Salad} title="Analyze Food" desc="Safe · Limit · Avoid" />
          <QuickAction to="/voice" tid="qa-voice" icon={PhoneCall} title="Voice Summary" desc="Today's health call" tone="lime" />
        </div>
      </div>

      {/* Cultural + Seasonal */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-orange-200/40 blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Flame className="h-4 w-4" /> Cultural Mode
          </div>
          <h3 className="mt-2 font-display font-extrabold text-2xl text-navy">Festive eating, wisely</h3>
          <p className="mt-2 text-slate-600">
            Diwali sweets next week — for diabetic elders, prefer <b>khoya-free badam halwa</b> over pedhas. Limit 1 small piece after lunch.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="chip !text-xs !py-1">Diwali</span>
            <span className="chip !text-xs !py-1">Diabetic-safe</span>
            <span className="chip !text-xs !py-1">Portion control</span>
          </div>
        </div>
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-sky-glow blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Sun className="h-4 w-4" /> Seasonal Mode
          </div>
          <h3 className="mt-2 font-display font-extrabold text-2xl text-navy">Stay hydrated today</h3>
          <p className="mt-2 text-slate-600">
            Temperature in {user?.profile?.city || "your city"} is warm. Drink at least <b>8 glasses</b>, add a pinch of salt-lemon water at noon.
          </p>
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="chip !text-xs !py-1">Heat care</span>
            <span className="chip !text-xs !py-1">Hydration</span>
            <span className="chip !text-xs !py-1">Electrolytes</span>
          </div>
        </div>
      </div>

      {/* Alerts strip */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caregiver Alerts</div>
            <h3 className="mt-1 font-display font-extrabold text-2xl text-navy">Recent notifications</h3>
          </div>
          <Link to="/alerts" className="text-sm font-bold text-navy underline-offset-4 hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {(data?.unread_alerts || []).slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                a.priority === "critical" ? "bg-red-100 text-red-600" :
                a.priority === "high" ? "bg-orange-100 text-orange-600" :
                "bg-sky-glow text-navy"
              }`}>
                <BellRing className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-navy">{a.title}</div>
                <div className="text-sm text-slate-600">{a.message}</div>
              </div>
            </div>
          ))}
          {(!data?.unread_alerts || data.unread_alerts.length === 0) && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              All clear — no alerts right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = "light", tid }) {
  const base =
    tone === "dark"
      ? "glass-dark"
      : tone === "lime"
        ? "bg-lime text-navy border border-lime"
        : "glass";
  const sub = tone === "dark" ? "text-white/60" : "text-slate-500";
  return (
    <div data-testid={tid} className={`${base} rounded-3xl p-5`}>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          tone === "dark" ? "bg-lime text-navy" : tone === "lime" ? "bg-navy text-lime" : "bg-white shadow-glass"
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <Sparkles className={`h-4 w-4 ${tone === "dark" ? "text-white/40" : "text-slate-300"}`} />
      </div>
      <div className="mt-4 font-display font-black text-3xl">{value}</div>
      <div className={`text-sm font-semibold ${sub}`}>{label}</div>
      <div className={`text-xs mt-1 ${sub}`}>{hint}</div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, desc, tone = "light", tid }) {
  const cls =
    tone === "dark"
      ? "glass-dark"
      : tone === "lime"
        ? "bg-lime border border-lime"
        : "glass";
  const text = tone === "dark" ? "text-white" : "text-navy";
  return (
    <Link to={to} data-testid={tid} className={`${cls} block rounded-3xl p-5 hover:-translate-y-1 transition-all`}>
      <div className="flex items-center justify-between">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
          tone === "dark" ? "bg-lime text-navy" : "bg-white shadow-glass"
        }`}>
          <Icon className="h-5 w-5 text-navy" />
        </div>
        <ArrowUpRight className={`h-5 w-5 ${tone === "dark" ? "text-white/60" : "text-slate-400"}`} />
      </div>
      <div className={`mt-4 font-display font-extrabold text-xl ${text}`}>{title}</div>
      <div className={`text-sm ${tone === "dark" ? "text-white/60" : "text-slate-600"}`}>{desc}</div>
    </Link>
  );
}
