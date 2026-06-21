"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-[260px] h-[120px] rounded-4xl" style={{ background: "#1a120b" }}>
            <Image src="/logo.png" alt="Chandra Hotel & Restaurant logo" width={140} height={140} className="w-full h-full object-cover" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-cream text-3xl mb-1">
            <span className="italic text-saffron">Chandra Hotel & Restaurant</span>
          </h1>
          <p className="text-cream/50 text-sm">Admin Dashboard</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-espresso-l rounded-2xl border border-cream/10 p-7 flex flex-col gap-4"
        >
          {error && (
            <div className="flex items-center gap-2 bg-chili/20 border border-chili/40 text-chili rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-cream/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="username"
                className="w-full bg-espresso border border-cream/10 text-cream rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 placeholder:text-cream/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-cream/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                className="w-full bg-espresso border border-cream/10 text-cream rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 placeholder:text-cream/20"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cream/30 hover:text-cream/60"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-saffron text-espresso font-bold py-3 text-sm hover:bg-saffron/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-cream/30 text-xs mt-6">
          This page is for authorised staff only.
        </p>
      </div>
    </div>
  );
}
