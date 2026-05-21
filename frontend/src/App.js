import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Coach from "@/pages/Coach";
import Food from "@/pages/Food";
import Medications from "@/pages/Medications";
import Voice from "@/pages/Voice";
import Alerts from "@/pages/Alerts";
import SOS from "@/pages/SOS";
import Profile from "@/pages/Profile";

function OnboardingGate({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="app-shell-bg min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl px-8 py-6 text-navy font-bold">Loading…</div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<OnboardingGate><Onboarding /></OnboardingGate>} />
          <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
          <Route path="/coach" element={<Shell><Coach /></Shell>} />
          <Route path="/food" element={<Shell><Food /></Shell>} />
          <Route path="/medications" element={<Shell><Medications /></Shell>} />
          <Route path="/voice" element={<Shell><Voice /></Shell>} />
          <Route path="/alerts" element={<Shell><Alerts /></Shell>} />
          <Route path="/sos" element={<Shell><SOS /></Shell>} />
          <Route path="/profile" element={<Shell><Profile /></Shell>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
