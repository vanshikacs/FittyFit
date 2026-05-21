import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="app-shell-bg min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl px-8 py-6 text-navy font-bold">Loading…</div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}
