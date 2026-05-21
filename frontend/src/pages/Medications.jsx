import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Pill, Plus, Clock, Trash2, Check, X, Activity } from "lucide-react";
import { toast } from "sonner";

export default function Medications() {
  const [meds, setMeds] = useState([]);
  const [adherence, setAdherence] = useState(100);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", time: "08:00", frequency: "Daily", notes: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get("/medications");
    setMeds(data.medications || []);
    setAdherence(data.adherence ?? 100);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/medications", form);
      toast.success("Medicine added");
      setForm({ name: "", dosage: "", time: "08:00", frequency: "Daily", notes: "" });
      setShowForm(false);
      load();
    } catch {
      toast.error("Failed to add");
    } finally {
      setBusy(false);
    }
  };

  const del = async (id) => {
    await api.delete(`/medications/${id}`);
    toast.success("Removed");
    load();
  };

  const log = async (id, status) => {
    await api.post("/medications/log", { medication_id: id, status });
    toast.success(status === "taken" ? "Marked taken" : "Marked missed");
    load();
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-navy text-lime flex items-center justify-center">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medications</div>
            <h1 className="font-display font-black text-2xl text-navy">Stay on schedule, every day.</h1>
          </div>
        </div>
        <button data-testid="med-add-toggle" onClick={() => setShowForm((s) => !s)} className="btn-cta">
          <Plus className="h-4 w-4" /> Add medicine
        </button>
      </div>

      {/* Adherence */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-3xl p-6 md:col-span-2">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-navy" />
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adherence · last 7 days</div>
          </div>
          <div className="mt-3 flex items-end gap-3">
            <div className="font-display font-black text-6xl text-navy">{adherence}%</div>
            <div className="pb-3 text-slate-600">
              {adherence >= 90 ? "Excellent consistency." : adherence >= 70 ? "Good, can improve." : "Needs attention."}
            </div>
          </div>
          <div className="mt-5 h-3 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-lime transition-all" style={{ width: `${adherence}%` }} />
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total medicines</div>
          <div className="mt-3 font-display font-black text-6xl text-navy">{meds.length}</div>
          <div className="text-slate-600 mt-1">Active in your schedule</div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={add} className="glass rounded-3xl p-6 grid md:grid-cols-5 gap-3" data-testid="med-form">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Medicine name" data-testid="med-name" className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none text-navy" />
          <input required value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Dosage (e.g. 500mg)" data-testid="med-dosage" className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none text-navy" />
          <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} data-testid="med-time" className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none text-navy" />
          <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} data-testid="med-frequency" className="px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none text-navy">
            <option>Daily</option>
            <option>Twice daily</option>
            <option>Thrice daily</option>
            <option>As needed</option>
          </select>
          <button disabled={busy} data-testid="med-save" className="btn-cta justify-center">{busy ? "Saving…" : "Save"}</button>
        </form>
      )}

      {/* Meds list */}
      <div className="grid md:grid-cols-2 gap-4">
        {meds.map((m) => (
          <div key={m.id} className="glass rounded-3xl p-5 flex items-start gap-4" data-testid={`med-item-${m.id}`}>
            <div className="h-12 w-12 rounded-2xl bg-sky-glow flex items-center justify-center shrink-0">
              <Pill className="h-5 w-5 text-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-xl text-navy">{m.name}</div>
              <div className="text-sm text-slate-600">{m.dosage} · {m.frequency}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-bold text-navy">
                <Clock className="h-3 w-3" /> {m.time}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => log(m.id, "taken")} data-testid={`med-taken-${m.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-lime text-navy text-xs font-bold hover:bg-lime-hover">
                  <Check className="h-3 w-3" /> Taken
                </button>
                <button onClick={() => log(m.id, "missed")} data-testid={`med-missed-${m.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-navy text-xs font-bold border border-slate-200 hover:bg-slate-50">
                  <X className="h-3 w-3" /> Missed
                </button>
              </div>
            </div>
            <button onClick={() => del(m.id)} data-testid={`med-delete-${m.id}`} className="h-9 w-9 rounded-xl bg-white hover:bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
            </button>
          </div>
        ))}
        {meds.length === 0 && (
          <div className="glass rounded-3xl p-10 text-center text-slate-500 md:col-span-2">
            No medicines yet. Tap <b>Add medicine</b> to get started.
          </div>
        )}
      </div>
    </div>
  );
}
