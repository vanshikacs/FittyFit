import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BellRing, CheckCircle2, AlertTriangle, Siren, Pill, Salad } from "lucide-react";
import { toast } from "sonner";

const typeMeta = {
  missed_medication: { icon: Pill, tone: "high" },
  risky_food: { icon: Salad, tone: "medium" },
  sos: { icon: Siren, tone: "critical" },
};

const toneCls = {
  critical: "bg-red-100 text-red-600 border-red-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-sky-100 text-sky-700 border-sky-200",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const load = async () => {
    const { data } = await api.get("/alerts");
    setAlerts(data);
  };
  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await api.post(`/alerts/${id}/read`);
    toast.success("Marked as read");
    load();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-navy text-lime flex items-center justify-center">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caregiver Alerts</div>
          <h1 className="font-display font-black text-2xl text-navy">Stay informed, stay connected.</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {["critical", "high", "medium"].map((p) => (
          <div key={p} className="glass rounded-3xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{p} priority</div>
            <div className="mt-2 font-display font-black text-4xl text-navy">
              {alerts.filter((a) => a.priority === p).length}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center text-slate-500">
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
            All clear. No alerts right now.
          </div>
        )}
        {alerts.map((a) => {
          const meta = typeMeta[a.type] || { icon: AlertTriangle, tone: a.priority };
          const Icon = meta.icon;
          return (
            <div
              key={a.id}
              data-testid={`alert-${a.id}`}
              className={`glass rounded-3xl p-5 flex items-start gap-4 ${a.read ? "opacity-70" : ""}`}
            >
              <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0 ${toneCls[a.priority] || toneCls.low}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-display font-bold text-lg text-navy">{a.title}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${toneCls[a.priority] || toneCls.low}`}>
                    {a.priority}
                  </span>
                  {a.read && <span className="text-xs text-slate-500">read</span>}
                </div>
                <div className="text-slate-600 mt-0.5">{a.message}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              {!a.read && (
                <button onClick={() => markRead(a.id)} data-testid={`alert-read-${a.id}`} className="btn-ghost !py-2 !px-4 !text-xs shrink-0">
                  Mark read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
