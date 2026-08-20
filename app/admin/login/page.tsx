"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setSessionExpiredNotice(true);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
      </Link>

      <div className="clay-card p-6 sm:p-8 space-y-6">
        {/* Header Icon / Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto rounded-3xl bg-white p-2 flex items-center justify-center shadow-clay border border-white/90 overflow-hidden">
            <Image
              src="/icono.png"
              alt="Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Panel Administrativo
          </h1>
          <p className="text-xs text-slate-500">
            Acceso exclusivo para el administrador
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpiredNotice && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Tu sesión ha expirado por inactividad. Ingresa de nuevo.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Usuario
            </label>
            <div className="flex items-center clay-inset px-3.5 py-2.5">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <div className="flex items-center clay-inset px-3.5 py-2.5">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 clay-btn-metallic text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Ingresar al Panel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen px-4 flex flex-col justify-center items-center relative py-12">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
