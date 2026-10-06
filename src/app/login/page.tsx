"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = {
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string | null;
    role?: {
      id: string;
      name: string;
    } | null;
  };
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const setup = searchParams.get("setup");

    if (setup === "success") {
      setSuccess(
        "Administrator berhasil dibuat. Silakan login menggunakan akun tersebut."
      );
    }

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Biarkan user tetap berada di halaman login.
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const raw = await response.text();

      let data: LoginResponse = {};

      if (raw.trim()) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error(
            `Server mengembalikan response yang tidak valid. HTTP ${response.status}.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Login gagal. HTTP ${response.status}.`
        );
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Memeriksa sesi...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
              A
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Administrator
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Masuk ke sistem Kasir POS
            </p>
          </div>

          {success && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@tokoku.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <button
              type="button"
              onClick={() => router.push("/setup")}
              disabled={loading}
              className="text-sm font-medium text-slate-500 hover:text-blue-600"
            >
              Belum ada Administrator?
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Kasir POS • Administrator
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm text-slate-500">
          Memuat halaman login...
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}