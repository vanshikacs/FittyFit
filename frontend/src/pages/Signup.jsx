import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Stethoscope, ArrowUpRight, User, Mail, Lock, Phone, HeartHandshake, Activity } from "lucide-react";
import { toast } from "sonner";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "elder",
  });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const { confirm, ...payload } = form;
      await signup(payload);
      toast.success("Welcome to Fittyfit!");
      nav("/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell-bg min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-[32px] p-8 md:p-10 order-2 lg:order-1">
          <div className="mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-navy text-lime flex items-center justify-center">
                <Stethoscope className="h-4 w-4" />
              </div>
              <span className="font-display font-black text-navy">Fittyfit</span>
            </Link>
          </div>
          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Create account</div>
            <h2 className="mt-1 font-display font-black text-3xl md:text-4xl text-navy">
              Start caring, smarter.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { v: "elder", label: "I'm an Elder / User", icon: HeartHandshake },
              { v: "caregiver", label: "I'm a Caregiver", icon: Activity },
            ].map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                type="button"
                data-testid={`role-${v}`}
                onClick={() => setForm({ ...form, role: v })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  form.role === v
                    ? "bg-navy text-white border-navy"
                    : "bg-white border-slate-200 text-navy hover:border-navy"
                }`}
              >
                <Icon className="h-5 w-5 mb-2" />
                <div className="font-display font-bold text-sm leading-tight">{label}</div>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name" icon={User} v={form.full_name} onChange={set("full_name")} tid="signup-name" />
            <Field label="Email" type="email" icon={Mail} v={form.email} onChange={set("email")} tid="signup-email" />
            <Field label="Phone" type="tel" icon={Phone} v={form.phone} onChange={set("phone")} tid="signup-phone" />
            <Field label="Password" type="password" icon={Lock} v={form.password} onChange={set("password")} tid="signup-password" />
            <Field label="Confirm password" type="password" icon={Lock} v={form.confirm} onChange={set("confirm")} tid="signup-confirm" />
            <button data-testid="signup-submit" type="submit" disabled={busy} className="btn-cta w-full justify-center">
              {busy ? "Creating…" : "Create Account"} <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-5 text-sm text-slate-600 text-center">
            Already with us?{" "}
            <Link to="/login" className="font-bold text-navy underline-offset-4 hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hidden lg:block order-1 lg:order-2">
          <div className="glass rounded-[32px] h-full p-8 overflow-hidden relative">
            <img
              src="https://images.pexels.com/photos/8527647/pexels-photo-8527647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Caregiver"
              className="rounded-[24px] w-full h-[480px] object-cover"
            />
            <div className="absolute top-10 right-10 chip">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 12,400 families care here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, v, onChange, type = "text", tid }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 focus-within:border-navy">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          data-testid={tid}
          required
          type={type}
          value={v}
          onChange={onChange}
          className="flex-1 outline-none bg-transparent text-navy"
        />
      </div>
    </div>
  );
}
