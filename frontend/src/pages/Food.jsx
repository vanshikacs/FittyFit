import React, { useRef, useState } from "react";
import { api } from "@/lib/api";
import { Upload, Salad, Sparkles, CheckCircle2, AlertTriangle, XCircle, Pill, Sun, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const verdictMeta = {
  safe: { cls: "verdict-safe", icon: CheckCircle2, label: "Safe" },
  limit: { cls: "verdict-limit", icon: AlertTriangle, label: "Limit" },
  avoid: { cls: "verdict-avoid", icon: XCircle, label: "Avoid" },
};

export default function Food() {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Please upload JPEG, PNG, or WEBP");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setBase64(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!base64 && !foodName.trim()) {
      toast.error("Upload a photo or type a food name");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.post("/food/analyze", {
        image_base64: base64 || undefined,
        food_name: foodName.trim() || undefined,
      });
      setResult(data);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const v = result ? verdictMeta[result.verdict] || verdictMeta.limit : null;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass rounded-3xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-lime text-navy flex items-center justify-center">
          <Salad className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Analysis</div>
          <h1 className="font-display font-black text-2xl text-navy">Is this meal right for you?</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-3xl p-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Upload meal photo</div>
          <button
            onClick={() => inputRef.current?.click()}
            data-testid="food-upload-trigger"
            className="w-full h-64 rounded-3xl border-2 border-dashed border-slate-300 hover:border-navy bg-white/50 flex flex-col items-center justify-center gap-3 transition-all"
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <>
                <div className="h-14 w-14 rounded-2xl bg-sky-glow flex items-center justify-center">
                  <Upload className="h-6 w-6 text-navy" />
                </div>
                <div className="font-display font-bold text-navy">Tap to upload a photo</div>
                <div className="text-xs text-slate-500">JPEG · PNG · WEBP</div>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFile}
            data-testid="food-upload-input"
            className="hidden"
          />

          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Or type food name</div>
            <input
              data-testid="food-name-input"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g. Aloo paratha with butter"
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-navy outline-none text-navy"
            />
          </div>

          <button onClick={analyze} disabled={busy} data-testid="food-analyze-btn" className="btn-cta w-full justify-center mt-5">
            <Sparkles className="h-4 w-4" />
            {busy ? "Analyzing…" : "Analyze with AI"}
          </button>
        </div>

        <div className="glass rounded-3xl p-6 min-h-[420px]">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI verdict</div>
          {!result && !busy && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center gap-3">
              <ImageIcon className="h-10 w-10 text-slate-300" />
              <p>Upload a photo or type a food name to get personalized guidance.</p>
            </div>
          )}
          {busy && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-navy animate-spin" />
              <p>Analyzing your meal…</p>
            </div>
          )}
          {result && v && (
            <div className="space-y-4" data-testid="food-result">
              <div className={`${v.cls} rounded-3xl p-6 flex items-center gap-4`}>
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center">
                  <v.icon className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-black text-3xl">{v.label}</div>
                  <div className="font-semibold">{result.food_name}</div>
                </div>
              </div>
              <InfoRow icon={Sparkles} title="Why?" text={result.reason} />
              {result.medicine_interaction && <InfoRow icon={Pill} title="Medicine interaction" text={result.medicine_interaction} />}
              {result.seasonal_note && <InfoRow icon={Sun} title="Seasonal note" text={result.seasonal_note} />}
              {result.alternatives?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Better alternatives</div>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives.map((a) => (
                      <span key={a} className="chip !bg-white">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, title, text }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100">
      <div className="h-9 w-9 rounded-xl bg-sky-glow flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-navy" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</div>
        <div className="text-slate-800 mt-0.5">{text}</div>
      </div>
    </div>
  );
}
