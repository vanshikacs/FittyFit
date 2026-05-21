import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Stethoscope, ArrowUpRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}`);
      nav(user.onboarded ? "/dashboard" : "/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell-bg min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-6">
        <div className="hidden lg:block relative">
          <div className="glass rounded-[32px] h-full p-8 flex flex-col justify-between overflow-hidden">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-navy text-lime flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="font-display font-black text-xl text-navy">Fittyfit</span>
            </Link>
            <div>
              <h1 className="font-display font-black text-5xl text-navy leading-[1.05]">
                Welcome back.<br />
                <span className="text-slate-500">Let's take care of today.</span>
              </h1>
              <div className="mt-8 chip"><span className="text-lime bg-navy rounded-full px-2 py-0.5">AI</span> Your coach is ready</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-[32px] p-8 md:p-10">
          <div className="mb-8">
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sign in</div>
            <h2 className="mt-1 font-display font-black text-3xl md:text-4xl text-navy">Good to see you again.</h2>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
              <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 focus-within:border-navy">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  data-testid="login-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@family.in"
                  className="flex-1 outline-none bg-transparent text-navy"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <div className="mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-200 focus-within:border-navy">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  data-testid="login-password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none bg-transparent text-navy"
                />
              </div>
            </div>
            <button data-testid="login-submit" type="submit" disabled={busy} className="btn-cta w-full justify-center">
              {busy ? "Signing in…" : "Sign In"} <ArrowUpRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-6 text-sm text-slate-600 text-center">
            New to Fittyfit?{" "}
            <Link to="/signup" className="font-bold text-navy underline-offset-4 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
