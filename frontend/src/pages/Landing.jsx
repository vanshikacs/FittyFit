import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Brain,
  Stethoscope,
  Pill,
  Salad,
  PhoneCall,
  Siren,
  Sparkles,
  Shield,
  Sun,
  Flame,
  ArrowUpRight,
  BellRing,
  Activity,
  CheckCircle2,
  Wind,
} from "lucide-react";

const MetricChip = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`chip ${className}`}>
    <Icon className="h-4 w-4 text-navy" />
    <span>{label}</span>
    {value && <span className="text-lime bg-navy rounded-full px-2 py-0.5 text-[10px] ml-1">{value}</span>}
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, tone = "light", tid }) => (
  <div
    data-testid={tid}
    className={`group relative overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:-translate-y-1 ${
      tone === "dark"
        ? "glass-dark"
        : tone === "blue"
          ? "bg-gradient-to-br from-sky-glow to-white border border-white"
          : "glass"
    }`}
  >
    <div className="flex items-start justify-between">
      <div
        className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
          tone === "dark" ? "bg-lime text-navy" : "bg-white shadow-glass"
        }`}
      >
        <Icon className={`h-7 w-7 ${tone === "dark" ? "text-navy" : "text-navy"}`} />
      </div>
      <div className="h-9 w-9 rounded-full bg-lime flex items-center justify-center transition-transform group-hover:rotate-45">
        <ArrowUpRight className="h-4 w-4 text-navy" />
      </div>
    </div>
    <h3 className={`mt-6 text-2xl font-display font-extrabold leading-tight ${tone === "dark" ? "text-white" : "text-navy"}`}>
      {title}
    </h3>
    <p className={`mt-2 text-[15px] ${tone === "dark" ? "text-white/70" : "text-slate-600"}`}>
      {desc}
    </p>
  </div>
);

export default function Landing() {
  return (
    <div className="app-shell-bg relative">
      {/* Gigantic brand watermark */}
      <div className="pointer-events-none select-none absolute top-0 left-0 right-0 text-center overflow-hidden">
        <div className="font-display font-black text-[18vw] leading-[0.85] tracking-tighter text-white/60 mt-2">
          FITTYFIT
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Nav */}
        <nav className="glass rounded-full px-4 py-2 flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2 pl-2" data-testid="brand-link">
            <div className="h-9 w-9 rounded-xl bg-navy text-lime flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-display font-black text-lg text-navy">Fittyfit</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#features" className="hover:text-navy">Features</a>
            <a href="#how" className="hover:text-navy">How it works</a>
            <a href="#about" className="hover:text-navy">About</a>
            <a href="#impact" className="hover:text-navy">Impact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" data-testid="nav-signin" className="btn-ghost !py-2 !px-4 !text-sm">
              Sign in
            </Link>
            <Link to="/signup" data-testid="nav-getstarted" className="btn-cta !py-2 !px-4 !text-sm">
              Get Started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 relative">
            <div className="chip mb-6" data-testid="hero-badge">
              <Sparkles className="h-4 w-4 text-lime fill-lime" /> India-First AI Health Companion
            </div>
            <h1 className="font-display font-black text-navy tracking-tight leading-[0.95] text-5xl sm:text-6xl lg:text-[88px]">
              Smart. Caring.
              <br />
              <span className="inline-block relative">
                AI Eldercare
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-lime rounded-full opacity-70 -z-10" />
              </span>
              <br />
              that truly listens.
            </h1>
            <p className="mt-7 text-lg text-slate-600 max-w-xl leading-relaxed">
              An AI-powered eldercare companion for Indian families — medication reminders,
              food guidance, caregiver alerts, daily voice summaries, and one-tap SOS support.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" data-testid="hero-cta-button" className="btn-cta">
                Get Started Free <ArrowUpRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="btn-ghost">
                Explore Features
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <MetricChip icon={Heart} label="24/7 AI Guidance" />
              <MetricChip icon={PhoneCall} label="Daily Voice Summary" />
              <MetricChip icon={Siren} label="Emergency SOS" />
              <MetricChip icon={Pill} label="Medicine Tracking" />
            </div>
          </div>

          {/* Hero visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[32px] overflow-hidden glass p-3">
              <img
                src="https://images.unsplash.com/photo-1774437790863-88a80bca5b29?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxlbGRlcmx5JTIwaW5kaWFuJTIwd29tYW4lMjBzbWlsaW5nfGVufDB8fHx8MTc3NjkyMjU3Nnww&ixlib=rb-4.1.0&q=85"
                alt="Indian elderly caregiver"
                className="rounded-[24px] w-full h-[520px] object-cover"
              />
              {/* Floating cards over image */}
              <div className="absolute top-8 -left-4 glass rounded-2xl p-4 floating shadow-floating" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-lime flex items-center justify-center">
                    <Activity className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Adherence</div>
                    <div className="font-display font-black text-navy text-xl">96%</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-28 -right-2 glass rounded-2xl p-4 floating shadow-floating" style={{ animationDelay: "1.2s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-navy flex items-center justify-center">
                    <Brain className="h-5 w-5 text-lime" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">AI Coach</div>
                    <div className="font-display font-black text-navy text-sm">Always on</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 glass rounded-2xl p-4 floating shadow-floating" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-glow to-white flex items-center justify-center">
                    <PhoneCall className="h-5 w-5 text-navy" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Voice call</div>
                    <div className="font-display font-black text-navy text-sm">7:30 AM daily</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento */}
        <section id="features" className="mt-24">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="chip"><Sparkles className="h-4 w-4" /> Features</div>
              <h2 className="mt-4 font-display font-black text-4xl md:text-5xl text-navy tracking-tight max-w-2xl">
                Everything an elder and their family need, in one calm place.
              </h2>
            </div>
            <Link to="/signup" className="btn-dark !text-sm">Try the full demo</Link>
          </div>

          <div className="grid md:grid-cols-6 gap-5">
            <div className="md:col-span-3"><FeatureCard tid="feature-coach" icon={Brain} title="AI Health Coach" desc="Ask anything — diet, missed medicine, symptoms. Personalized to your conditions." /></div>
            <div className="md:col-span-3"><FeatureCard tid="feature-food" tone="dark" icon={Salad} title="Food Analysis" desc="Snap your thali. Get instant Safe / Limit / Avoid verdict with safer Indian alternatives." /></div>
            <div className="md:col-span-2"><FeatureCard tid="feature-meds" icon={Pill} title="Medicine Tracking" desc="Smart reminders, adherence score, and auto-alerts to caregivers when missed." /></div>
            <div className="md:col-span-2"><FeatureCard tid="feature-voice" tone="blue" icon={PhoneCall} title="Daily Voice Call" desc="Warm Hinglish voice summary — medicines, weather, and care tips every morning." /></div>
            <div className="md:col-span-2"><FeatureCard tid="feature-sos" icon={Siren} title="One-Tap SOS" desc="Instant alert to family with blood group, meds, and last location." /></div>
            <div className="md:col-span-3"><FeatureCard tid="feature-cultural" icon={Flame} title="Cultural Mode" desc="Festival-aware, fasting-safe, and sweet-moderation guidance for Indian families." /></div>
            <div className="md:col-span-3"><FeatureCard tid="feature-seasonal" tone="blue" icon={Sun} title="Seasonal Intelligence" desc="Heat, monsoon, winter — hydration and infection alerts tuned to your city." /></div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mt-28 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative">
            <div className="rounded-[32px] overflow-hidden glass p-3">
              <img
                src="https://images.pexels.com/photos/8527647/pexels-photo-8527647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Caregiver helping elder"
                className="rounded-[24px] w-full h-[460px] object-cover"
              />
            </div>
            <div className="absolute -top-6 -right-4 chip">
              <Shield className="h-4 w-4 text-navy" /> For Indian Families
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="chip"><Heart className="h-4 w-4" /> Who it's for</div>
            <h2 className="mt-4 font-display font-black text-4xl md:text-5xl text-navy">
              Built for elders, loved by caregivers.
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              Fittyfit speaks gently in Hindi or English, understands the Indian kitchen, respects festivals and fasts,
              and never lets a loved one miss a dose or a warning sign again.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              {[
                { t: "Elderly users", d: "Large, readable cards. Voice-first. Reassuring tone." },
                { t: "Chronic patients", d: "Diabetes, BP, heart, kidney — AI tuned to your condition." },
                { t: "Caregivers", d: "Real-time alerts when a dose is missed or a risky meal is scanned." },
                { t: "Families", d: "Peace of mind from anywhere — daily summaries, SOS, location." },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-3 p-4 rounded-2xl bg-white/60">
                  <CheckCircle2 className="h-5 w-5 text-lime-hover shrink-0 mt-0.5" style={{ color: "#65a30d" }} />
                  <div>
                    <div className="font-display font-bold text-navy">{x.t}</div>
                    <div className="text-sm text-slate-600">{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mt-28">
          <div className="chip"><Wind className="h-4 w-4" /> How it works</div>
          <h2 className="mt-4 font-display font-black text-4xl md:text-5xl text-navy max-w-3xl">
            From signup to SOS — six gentle steps.
          </h2>
          <div className="mt-10 grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ["01", "Sign up & profile"],
              ["02", "Add health details"],
              ["03", "Meet AI Coach"],
              ["04", "Track meds & meals"],
              ["05", "Daily voice call"],
              ["06", "SOS when needed"],
            ].map(([n, t], i) => (
              <div key={n} className="glass rounded-3xl p-5 relative overflow-hidden">
                <div className="text-sm font-black text-lime-hover" style={{ color: "#65a30d" }}>{n}</div>
                <div className="mt-3 font-display font-extrabold text-navy text-xl leading-tight">{t}</div>
                {i < 5 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-slate-300">→</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Impact stats */}
        <section id="impact" className="mt-28">
          <div className="glass rounded-[32px] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-lime/30 blur-3xl" />
            <div className="grid md:grid-cols-2 gap-10 items-center relative">
              <div>
                <div className="chip"><Activity className="h-4 w-4" /> Our impact</div>
                <h2 className="mt-4 font-display font-black text-4xl md:text-5xl text-navy">
                  Numbers that mean peace of mind.
                </h2>
                <p className="mt-3 text-slate-600 max-w-lg">
                  Measured improvements across Indian elderly households in pilot programs.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["2.4×", "Better medication adherence"],
                  ["<30s", "Caregiver alert response"],
                  ["12", "Indian languages supported"],
                  ["98%", "Elder-friendly usability"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-3xl bg-white p-5 shadow-glass">
                    <div className="font-display font-black text-4xl text-navy leading-none">{v}</div>
                    <div className="mt-2 text-sm text-slate-600">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-28">
          <div className="chip"><Heart className="h-4 w-4" /> Trusted by families</div>
          <h2 className="mt-4 font-display font-black text-4xl md:text-5xl text-navy max-w-2xl">
            Gentle care, every day.
          </h2>
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            {[
              { q: "Mummy never misses her BP medicine now. The voice call in Hindi feels like a daughter reminding her.", a: "Riya, Mumbai" },
              { q: "Before festivals, the AI gently tells Papa what to avoid. It understands our food.", a: "Aarav, Jaipur" },
              { q: "I live in Bangalore, my parents in Kanpur. SOS alerts reach me in seconds.", a: "Neha, Bangalore" },
            ].map((t) => (
              <div key={t.a} className="glass rounded-3xl p-7">
                <BellRing className="h-6 w-6 text-navy" />
                <p className="mt-4 text-lg text-slate-700 leading-relaxed">"{t.q}"</p>
                <div className="mt-5 font-display font-bold text-navy">{t.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section className="mt-28">
          <div className="rounded-[32px] bg-navy text-white p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-lime/20 blur-3xl rounded-full" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <h2 className="font-display font-black text-4xl md:text-6xl leading-[1] tracking-tight">
                Your parent deserves<br />a smarter kind of care.
              </h2>
              <div className="md:text-right">
                <p className="text-white/70 text-lg max-w-md md:ml-auto">
                  Start free. Set up in 3 minutes. Designed with love for Indian families.
                </p>
                <Link to="/signup" data-testid="footer-cta" className="btn-cta mt-6">
                  Get Started Free <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-navy text-lime flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-navy">Fittyfit</span>
            <span className="text-slate-400">© 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
