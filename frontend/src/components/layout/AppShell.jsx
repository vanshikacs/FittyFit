import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquareHeart,
  Salad,
  Pill,
  PhoneCall,
  BellRing,
  Siren,
  User,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard, tid: "nav-dashboard" },
  { to: "/coach", label: "AI Coach", icon: MessageSquareHeart, tid: "nav-coach" },
  { to: "/food", label: "Food Analysis", icon: Salad, tid: "nav-food" },
  { to: "/medications", label: "Medicines", icon: Pill, tid: "nav-medications" },
  { to: "/voice", label: "Voice Summary", icon: PhoneCall, tid: "nav-voice" },
  { to: "/alerts", label: "Alerts", icon: BellRing, tid: "nav-alerts" },
  { to: "/profile", label: "Profile", icon: User, tid: "nav-profile" },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="app-shell-bg">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-6 h-[calc(100vh-3rem)]">
            <div className="glass rounded-3xl p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-8" data-testid="brand-logo">
                <div className="h-10 w-10 rounded-2xl bg-navy text-lime flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-black text-xl text-navy leading-none">
                    Fittyfit
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    AI Eldercare
                  </div>
                </div>
              </div>
              <nav className="flex-1 space-y-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    data-testid={l.tid}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                        isActive
                          ? "bg-navy text-white shadow-floating"
                          : "text-slate-800 hover:bg-white hover:text-navy"
                      }`
                    }
                  >
                    <l.icon className="h-5 w-5" />
                    {l.label}
                  </NavLink>
                ))}
              </nav>
              <button
                data-testid="sidebar-sos"
                onClick={() => nav("/sos")}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-500 text-white font-bold animate-pulse-sos hover:bg-red-600"
              >
                <Siren className="h-5 w-5" /> Emergency SOS
              </button>
              <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-white/60">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-glow to-lime flex items-center justify-center font-black text-navy">
                  {user?.full_name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-navy truncate">
                    {user?.full_name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500">
                    {user?.role}
                  </div>
                </div>
                <button
                  data-testid="logout-btn"
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                  className="p-2 rounded-xl hover:bg-white"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 pb-24">{children}</main>
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <div className="glass rounded-3xl p-2 flex justify-around">
            {links.slice(0, 5).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-2xl ${
                    isActive ? "bg-navy text-white" : "text-slate-600"
                  }`
                }
              >
                <l.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{l.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
